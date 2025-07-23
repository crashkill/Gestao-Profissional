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
        percentual_compartilhamento: row['Percentual de Compartilhamento'] || null,
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
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
      >
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Check className="h-8 w-8 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-white mb-2">
            {previewData.length} Profissionais Importados!
          </h3>
          <p className="text-slate-300">Redirecionando para o dashboard...</p>
        </div>
      </motion.div>
    );
  }

  if (showPreview) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-8"
      >
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors mr-4"
                >
                  <ArrowLeft className="h-6 w-6 text-white" />
                </button>
                <h2 className="text-2xl font-bold text-white">
                  Prévia dos Dados ({previewData.length} profissionais)
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={processImport}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Confirmar Importação
              </motion.button>
            </div>
            <div className="overflow-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-800/80 backdrop-blur-sm">
                  <tr className="border-b border-white/20">
                    {previewData.length > 0 && Object.keys(previewData[0]).map((key) => (
                      <th key={key} className="text-left p-3 text-slate-300">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 100).map((row, index) => (
                    <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                      {Object.keys(row).map((key) => (
                        <td key={key} className="p-3 text-white">
                          {String(row[key as keyof ExcelRow] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.length > 100 && (
              <p className="text-slate-400 text-center mt-4">
                ...e mais {previewData.length - 100} profissionais
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8"
    >
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="flex items-center text-slate-300 hover:text-white mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>

        <h1 className="text-4xl font-bold text-white mb-4">Importar Profissionais</h1>
        <p className="text-slate-400 mb-8">
          Faça o upload de um arquivo .xlsx para adicionar múltiplos profissionais de uma vez.
        </p>

        <div 
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-300 ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500'}`}
        >
          <input type="file" id="file-upload" className="hidden" accept=".xlsx" onChange={handleFileInput} />
          <label htmlFor="file-upload" className="cursor-pointer">
            <FileSpreadsheet className="h-16 w-16 mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {dragActive ? 'Solte o arquivo aqui' : 'Arraste e solte ou clique para enviar'}
            </h3>
            <p className="text-slate-500">Apenas arquivos .xlsx são permitidos</p>
          </label>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-red-500/20 border border-red-500/50 text-red-300 p-4 rounded-lg flex items-center"
          >
            <AlertCircle className="h-5 w-5 mr-3" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="mt-8 text-center">
            <button onClick={generateTemplate} className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                <Download className="h-5 w-5 mr-2"/>
                Baixar modelo de planilha
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExcelImport;