import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, FileSpreadsheet, Check, AlertCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { Professional } from '../types/Professional';
import { supabase } from '../lib/supabaseClient';
import { useToast } from './ui/use-toast';

// Interface para representar uma linha do arquivo Excel
interface ExcelRow {
  'Nome Completo': string;
  'Email': string;
  'Área de Atuação': string;
  'Skill Principal': string;
  'Nível de Experiência': 'Júnior' | 'Pleno' | 'Sênior' | 'Especialista';
  'Gestor da Área'?: string;
  'Gestor Direto'?: string;
  'Disponível para Compartilhamento'?: 'Sim' | 'Não';
  'Percentual de Compartilhamento'?: '100' | '75' | '50' | '25';
  'Outras Skills'?: string;
}

interface ExcelImportProps {
  onImport: (professionals: Omit<Professional, 'id' | 'created_at'>[]) => void;
  onBack: () => void;
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onImport, onBack }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelRow[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    console.log('[ExcelImport] Iniciando processamento do arquivo:', file.name);
    setError('');
    
    if (!file.name.endsWith('.xlsx')) {
      setError('Por favor, selecione um arquivo .xlsx válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log('[ExcelImport] Arquivo lido com sucesso. Processando...');
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

        console.log(`[ExcelImport] ${jsonData.length} linhas encontradas no arquivo.`);

        if (jsonData.length === 0) {
          setError('O arquivo Excel está vazio');
          return;
        }

        const requiredColumns: (keyof ExcelRow)[] = ['Nome Completo', 'Email', 'Área de Atuação', 'Skill Principal', 'Nível de Experiência'];
        const firstRow = jsonData[0];
        const actualColumns = Object.keys(firstRow);
        console.log('[ExcelImport] Colunas encontradas no arquivo:', actualColumns);

        const missingColumns = requiredColumns.filter(col => !actualColumns.includes(col));
        
        if (missingColumns.length > 0) {
          const errorMessage = `Colunas obrigatórias faltando: ${missingColumns.join(', ')}`;
          console.error('[ExcelImport] Erro de validação:', errorMessage);
          setError(errorMessage);
          return;
        }

        console.log('[ExcelImport] Validação de colunas passou. Mostrando prévia.');
        setPreviewData(jsonData);
        setShowPreview(true);
      } catch (err) {
        const castedErr = err as Error;
        console.error('[ExcelImport] Erro no processamento do Excel:', castedErr);
        setError('Erro ao processar o arquivo Excel: ' + castedErr.message);
      }
    };
    reader.onerror = () => {
        setError('Não foi possível ler o arquivo.');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const generateTemplate = () => {
    const exampleData: ExcelRow[] = [
      {
        'Nome Completo': 'João Silva',
        'Email': 'joao.silva@exemplo.com',
        'Área de Atuação': 'Desenvolvimento Frontend',
        'Skill Principal': 'React',
        'Nível de Experiência': 'Pleno',
        'Gestor da Área': 'Maria Gerente',
        'Gestor Direto': 'Carlos Supervisor',
        'Disponível para Compartilhamento': 'Sim',
        'Percentual de Compartilhamento': '75',
        'Outras Skills': 'JavaScript, TypeScript, HTML, CSS'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(exampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Profissionais');
    XLSX.writeFile(wb, 'modelo_importacao_profissionais.xlsx');
  };

  const processImport = async () => {
    console.log(`[ExcelImport] Iniciando importação de ${previewData.length} profissionais.`);
    const { data: allSkills, error: skillsError } = await supabase.from('skills').select('id, nome, tipo');

    if (skillsError) {
      console.error("Erro ao buscar skills:", skillsError);
      setError("Não foi possível carregar as skills existentes para a importação.");
      return;
    }

    type Skill = { id: number; nome: string; tipo: string };

    const professionalsToImport: Omit<Professional, 'id' | 'created_at'>[] = await Promise.all(previewData.map(async (row) => {
      const outrasSkillsRaw = row['Outras Skills'] || '';
      const outrasSkillsArr = outrasSkillsRaw.split(',').map((s: string) => s.trim()).filter(Boolean);
      
      const skillsForThisRow: { nome: string; tipo: string }[] = [];

      for (const skillName of outrasSkillsArr) {
        let skill = allSkills?.find((s) => s.nome.toLowerCase() === skillName.toLowerCase());
        if (!skill) {
          const { data: newSkillData, error: insertError } = await supabase.from('skills').insert([{ nome: skillName, tipo: 'cargo' }]).select();
          
          if (insertError) {
            console.error(`Erro ao inserir nova skill '${skillName}':`, insertError);
            continue;
          }

          if (newSkillData && newSkillData[0]) {
            const newSkill = newSkillData[0] as Skill;
            allSkills?.push(newSkill);
            skill = newSkill;
          }
        }
        if (skill) skillsForThisRow.push({ nome: skill.nome, tipo: skill.tipo });
      }
      return {
        nome_completo: row['Nome Completo'] || '',
        email: row.Email || '',
        area_atuacao: row['Área de Atuação'] || null,
        skill_principal: row['Skill Principal'] || null,
        nivel_experiencia: row['Nível de Experiência'] || null,
        gestor_area: row['Gestor da Área'] || '',
        gestor_direto: row['Gestor Direto'] || '',
        outras_tecnologias: skillsForThisRow.map(s => `${s.nome} (${s.tipo})`).join(', '),
        hora_ultima_modificacao: new Date().toISOString(),
        disponivel_compartilhamento: row['Disponível para Compartilhamento']?.toLowerCase() === 'sim',
        percentual_compartilhamento: row['Percentual de Compartilhamento'] ? Number(row['Percentual de Compartilhamento']) : null,
        regime: null, local_alocacao: null, proficiencia_cargo: null, java: null, javascript: null, python: null, typescript: null, php: null, dotnet: null, react: null, angular: null, ionic: null, flutter: null, mysql: null, postgres: null, oracle_db: null, sql_server: null, mongodb: null, aws: null, azure: null, gcp: null, gerencia_projetos: null, administracao_projetos: null, analise_requisitos: null, android: null, cobol: null, linguagem_r: null, linguagem_c: null, linguagem_cpp: null, windows: null, raspberry_pi: null, arduino: null
      };
    }));
    onImport(professionalsToImport);
    console.log('[ExcelImport] Importação concluída. Mostrando sucesso e redirecionando.');
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onBack();
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[60vh] text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6"
          >
            <Check className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-4">Importação Concluída!</h2>
          <p className="text-slate-300 mb-8">Os profissionais foram importados com sucesso.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg"
          >
            Voltar ao Dashboard
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl" />
            <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPreview(false)}
                    className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-300 border border-slate-600/50"
                  >
                    <ArrowLeft className="h-6 w-6 text-white" />
                  </motion.button>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      Prévia dos Dados
                    </h2>
                    <p className="text-slate-300 text-lg">{previewData.length} profissionais encontrados</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={processImport}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Confirmar Importação
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden"
          >
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-sm">
                  <tr className="border-b border-slate-600/50">
                    {previewData.length > 0 && Object.keys(previewData[0]).map((key) => (
                      <th key={key} className="text-left p-4 text-slate-200 font-semibold">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 100).map((row, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className="border-b border-slate-700/30 hover:bg-slate-700/30 transition-colors duration-200"
                    >
                      {Object.keys(row).map((key) => (
                        <td key={key} className="p-4 text-slate-100">
                          {String(row[key as keyof ExcelRow] ?? '')}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.length > 100 && (
              <div className="p-4 bg-slate-700/30 border-t border-slate-600/50">
                <p className="text-slate-400 text-center font-medium">
                  ...e mais {previewData.length - 100} profissionais
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-xl" />
          <div className="relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <div className="flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all duration-300 border border-slate-600/50"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                  Importar do Excel
                </h1>
                <p className="text-slate-300 text-lg">Faça upload de uma planilha Excel para importar profissionais</p>
              </div>
            </div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full mt-6"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${dragActive ? 'border-purple-500 bg-purple-500/10 scale-105' : 'border-slate-600/50 hover:border-slate-500/70 bg-slate-800/30'}`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 rounded-2xl" />
          <input type="file" id="file-upload" className="hidden" accept=".xlsx" onChange={handleFileInput} />
          <label htmlFor="file-upload" className="cursor-pointer relative z-10">
            <motion.div
              animate={dragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FileSpreadsheet className="h-20 w-20 mx-auto text-slate-400 mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {dragActive ? 'Solte o arquivo aqui' : 'Arraste e solte ou clique para enviar'}
            </h3>
            <p className="text-slate-400 text-lg">Apenas arquivos .xlsx são permitidos</p>
          </label>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 backdrop-blur-sm"
          >
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
            <span className="text-red-300 font-medium">{error}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateTemplate}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Download className="h-5 w-5" />
            Baixar Modelo de Planilha
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ExcelImport;