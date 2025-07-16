import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts'; // Adicionado BarChart, Bar, XAxis, YAxis, CartesianGrid
import { Users, UserPlus, Upload, BarChart3 } from 'lucide-react'; // Adicionado BarChart3 para "Linguagens Diferentes"
import { Professional } from '../types/Professional';
import { supabase, supabaseDirect, executeSupabaseQuery } from '../lib/supabaseClient'; // Importar instância Supabase
import ExcelJS from 'exceljs';

interface DashboardProps {
  professionals: Professional[]; // Ainda usado para "Total de Profissionais" e "Áreas de Atuação"
  onNavigate: (view: 'manual' | 'excel') => void;
}

// Tipos de dados para os novos gráficos
interface SkillProficiencyEntry {
  skill_name: string;
  proficiency_level: string;
  professional_count: number;
}

interface MainSkillChartItem {
  name: string; // Skill name
  total: number; // Total professionals com esta skill (excluindo "Sem conhecimento")
}

interface DrilldownChartItem {
  name: string; // Proficiency level (Júnior, Pleno, Sênior, Sem conhecimento, etc.)
  count: number; // Number of professionals at this level for the selected skill
  percentage?: number; // Opcional, pode ser calculado no frontend se necessário
}

interface ProfessionalDetail {
  nome_completo: string;
  email: string;
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#84cc16', '#6366f1', '#f97316',
  '#d946ef', '#22d3ee', '#a3e635', '#f472b6', '#fbbf24' // Adicionando mais cores
];

// Função para formatar nomes próprios (primeira letra maiúscula, resto minúscula)
const formatName = (name: string) => {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Ignora palavras vazias ou apenas com espaços
      if (!word) return word;
      // Lista de preposições e artigos que devem permanecer em minúsculo
      const minusculeWords = ['de', 'da', 'do', 'das', 'dos', 'e'];
      if (minusculeWords.includes(word)) return word;
      // Capitaliza a primeira letra
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const Dashboard: React.FC<DashboardProps> = ({ professionals, onNavigate }) => {
  const [skillProficiencyData, setSkillProficiencyData] = useState<SkillProficiencyEntry[]>([]);
  const [mainSkillsChartData, setMainSkillsChartData] = useState<MainSkillChartItem[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [drilldownChartData, setDrilldownChartData] = useState<DrilldownChartItem[]>([]);
  const [selectedProficiencyLevel, setSelectedProficiencyLevel] = useState<string | null>(null);
  const [professionalsList, setProfessionalsList] = useState<ProfessionalDetail[]>([]);
  const [loadingProfessionalsList, setLoadingProfessionalsList] = useState<boolean>(false);
  const [loadingChart, setLoadingChart] = useState<boolean>(true);
  const [errorChart, setErrorChart] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      console.log('[Dashboard] 📊 Iniciando busca dos dados do gráfico de skills...');
      setLoadingChart(true);
      setErrorChart(null);
      try {
        // Usar conexão direta (sem proxy) com o Supabase
        const { data, error } = await supabaseDirect.rpc('get_skill_proficiency_distribution');
        
        console.log('[Dashboard] 📊 Dados do gráfico recebidos:', data?.length || 0, 'registros');
        
        if (error) {
          console.error('[Dashboard] ❌ Erro da RPC de skills:', error);
          throw error;
        }

        if (data) {
          const rawData = data as SkillProficiencyEntry[];
          setSkillProficiencyData(rawData);

          // Processar dados para o gráfico principal de skills
          const aggregatedSkills: { [key: string]: number } = {};
          rawData.forEach(entry => {
            if (entry.proficiency_level !== 'Sem conhecimento') {
              aggregatedSkills[entry.skill_name] = (aggregatedSkills[entry.skill_name] || 0) + entry.professional_count;
            }
          });
          
          const mainChartData = Object.keys(aggregatedSkills)
            .map(skillName => ({
              name: skillName,
              total: aggregatedSkills[skillName],
            }))
            .filter(item => item.total > 0) // Mostrar apenas skills com algum profissional
            .sort((a, b) => b.total - a.total); // Opcional: ordenar por total
          
          console.log('[Dashboard] 📊 Gráfico processado:', mainChartData.length, 'skills encontradas');
          setMainSkillsChartData(mainChartData);
        }
      } catch (err: any) {
        console.error("[Dashboard] ❌ Erro ao buscar dados de proficiência de skills:", err);
        setErrorChart(err.message || 'Falha ao buscar dados dos gráficos.');
      } finally {
        setLoadingChart(false);
        console.log('[Dashboard] 📊 Busca do gráfico finalizada.');
      }
    };

    fetchData();
  }, []);

    // Tooltip e Legend serão adaptados/recriados para os gráficos de barras posteriormente

  const handleSkillClick = (skillName: string) => {
    setSelectedSkill(skillName);
    const filteredData = skillProficiencyData.filter(entry => entry.skill_name === skillName);
    
    // Ordenar os níveis de proficiência de forma lógica
    const proficiencyOrder = ['Júnior', 'Pleno', 'Sênior', 'Especialista', 'Sem conhecimento'];
    const sortedDrilldownData = filteredData
      .map(entry => ({
        name: entry.proficiency_level,
        count: entry.professional_count,
      }))
      .sort((a, b) => proficiencyOrder.indexOf(a.name) - proficiencyOrder.indexOf(b.name));

    console.log(`Dados de drilldown para ${skillName}:`, sortedDrilldownData);
    setDrilldownChartData(sortedDrilldownData);
  };

  const handleBackToMainChart = () => {
    setSelectedSkill(null);
    setDrilldownChartData([]);
    setSelectedProficiencyLevel(null);
    setProfessionalsList([]);
  };

  const handleProficiencyClick = async (proficiencyLevel: string) => {
    if (!selectedSkill) return;
    setSelectedProficiencyLevel(proficiencyLevel);
    setLoadingProfessionalsList(true);
    setProfessionalsList([]); // Limpa lista anterior
    try {
      const data: ProfessionalDetail[] | null = await executeSupabaseQuery(async (client) => {
        const { data: rpcData, error } = await client.rpc('get_professionals_by_skill_and_proficiency', {
          target_skill_name: selectedSkill,
          target_proficiency_level: proficiencyLevel,
        });
        if (error) throw error;
        return rpcData;
      });
      setProfessionalsList(data || []);
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao buscar lista de profissionais:', error);
      setErrorChart(error.message || 'Falha ao buscar lista de profissionais.'); // Reutilizando errorChart para simplicidade
    } finally {
      setLoadingProfessionalsList(false);
    }
  };

  const handleBackToDrilldownChart = () => {
    setSelectedProficiencyLevel(null);
    setProfessionalsList([]);
  };

  // Estado para armazenar contagens de tipos de contrato vindas do backend
  const [contractTypeCounts, setContractTypeCounts] = useState<{ cltCount: number, pjCount: number }>({ cltCount: 0, pjCount: 0 });
  const [loadingContractCounts, setLoadingContractCounts] = useState<boolean>(true);

  // Buscar contagens de CLT e PJ do Supabase
  useEffect(() => {
    const fetchContractCounts = async () => {
      console.log('[Dashboard] Iniciando busca por contagens de tipos de contrato...'); // Log 1
      setLoadingContractCounts(true);
      try {
        // Usar conexão direta (sem proxy) com o Supabase
        type ContractCount = { tipo_contrato: 'CLT' | 'PJ'; quantidade: number };
        const { data, error } = await supabaseDirect.rpc('get_contract_types_count');
        
        console.log('[Dashboard] Dados recebidos da RPC (direto):', data, 'Erro:', error); // Log 2
        
        if (error) {
          console.error('[Dashboard] Erro da RPC:', error); // Log 3
          throw error; // Joga o erro para ser pego pelo catch
        }

        let cltCount = 0;
        let pjCount = 0;
        
        if (data && Array.isArray(data)) {
          console.log('[Dashboard] Processando dados recebidos:', data); // Log adicional
          (data as ContractCount[]).forEach((item) => {
            if (item.tipo_contrato === 'CLT') {
              cltCount = Number(item.quantidade);
            } else if (item.tipo_contrato === 'PJ') {
              pjCount = Number(item.quantidade);
            }
          });
        } else {
          console.warn('[Dashboard] Nenhum dado ou formato inesperado recebido da RPC.');
        }
        
        setContractTypeCounts({ cltCount, pjCount });
        console.log('[Dashboard] Contagens definidas - CLT:', cltCount, 'PJ:', pjCount); // Log 4

      } catch (err) {
        const error = err as Error;
        console.error('[Dashboard] Erro ao buscar ou processar contagens de tipos de contrato:', error.message || err);
        // Mantém os valores zerados ou define um estado de erro, se preferir
        setContractTypeCounts({ cltCount: 0, pjCount: 0 });
      } finally {
        setLoadingContractCounts(false);
        console.log('[Dashboard] Busca por contagens finalizada.'); // Log 5
      }
    };
    
    fetchContractCounts();
  }, []); // Remover dependência do supabase

  // Função para exportar profissionais para Excel
  const exportToExcel = async (data: Professional[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Profissionais');
    
    // Definindo as colunas
    worksheet.columns = [
      { header: 'Nome Completo', key: 'nome_completo', width: 30 },
      { header: 'Email', key: 'email', width: 20 },
      { header: 'Área de Atuação', key: 'area_atuacao', width: 15 },
      { header: 'Skill Principal', key: 'skill_principal', width: 30 },
      { header: 'Nível de Experiência', key: 'nivel_experiencia', width: 15 },
      { header: 'Gestor da Área', key: 'gestor_area', width: 25 },
      { header: 'Gestor Direto', key: 'gestor_direto', width: 25 },
      { header: 'Disponível para Compartilhamento', key: 'disponivel_compartilhamento', width: 20 },
      { header: 'Percentual de Compartilhamento', key: 'percentual_compartilhamento', width: 15 },
      { header: 'Outras Skills/Cargos', key: 'outras_tecnologias', width: 30 },
      { header: 'Regime', key: 'regime', width: 10 },
      { header: 'Local Alocação', key: 'local_alocacao', width: 15 },
      { header: 'Proficiencia Cargo', key: 'proficiencia_cargo', width: 15 },
      { header: 'Hora Última Modificação', key: 'hora_ultima_modificacao', width: 25 },
      { header: 'Criado em', key: 'created_at', width: 20 }
    ];

    // Adicionando os dados
    data.forEach(professional => {
      worksheet.addRow({
        nome_completo: professional.nome_completo,
        email: professional.email,
        area_atuacao: professional.area_atuacao,
        skill_principal: professional.skill_principal,
        nivel_experiencia: professional.nivel_experiencia,
        gestor_area: professional.gestor_area,
        gestor_direto: professional.gestor_direto,
        disponivel_compartilhamento: professional.disponivel_compartilhamento ? 'Sim' : 'Não',
        percentual_compartilhamento: professional.percentual_compartilhamento,
        outras_tecnologias: professional.outras_tecnologias,
        regime: professional.regime,
        local_alocacao: professional.local_alocacao,
        proficiencia_cargo: professional.proficiencia_cargo,
        hora_ultima_modificacao: professional.hora_ultima_modificacao,
        created_at: professional.created_at
      });
    });

    // Estilizando o cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Exportando o arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'colaboradores_exportados.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-full">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-300 text-sm">Total de Profissionais</p>
              <p className="text-3xl font-bold text-white">{professionals.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/20 rounded-full">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-300 text-sm">CLT</p>
              <p className="text-3xl font-bold text-white">
                {loadingContractCounts ? '...' : contractTypeCounts.cltCount}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500/20 rounded-full">
              <Upload className="h-6 w-6 text-green-400" />
            </div>
            <div>
              <p className="text-slate-300 text-sm">PJ</p>
              <p className="text-3xl font-bold text-white">
                {loadingContractCounts ? '...' : contractTypeCounts.pjCount}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50"
      >
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {selectedSkill ? `Distribuição de Proficiência para ${selectedSkill}` : 'Visão Geral de Skills por Profissionais'}
        </h2>
        
        {loadingChart && (
          <div className="h-96 flex items-center justify-center">
            <p className="text-white text-xl">Carregando dados do gráfico...</p>
          </div>
        )}
        {!loadingChart && errorChart && (
          <div className="h-96 flex items-center justify-center">
            <p className="text-red-500 text-xl">Erro ao carregar gráfico: {errorChart}</p>
          </div>
        )}
        {!loadingChart && !errorChart && !selectedSkill && mainSkillsChartData.length > 0 && (
          <div className="h-[800px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mainSkillsChartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} stroke="#94a3b8" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  width={140} 
                  interval={0} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                  contentStyle={{ backgroundColor: 'rgba(30,41,59,0.9)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
                  itemStyle={{ color: '#cbd5e1' }}
                />
                <Legend wrapperStyle={{ color: '#fff', paddingTop: '10px' }} />
                <Bar dataKey="total" name="Total de Profissionais" fill="#3b82f6" radius={[0, 5, 5, 0]} barSize={18}>
                  {mainSkillsChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      onClick={() => handleSkillClick(entry.name)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {!loadingChart && !errorChart && selectedSkill && !selectedProficiencyLevel && (
          drilldownChartData.length > 0 ? (
            // Renderiza o gráfico de drilldown se houver dados
            <div className="h-[450px]"> {/* Aumentar altura para drilldown */}
              <button 
                onClick={handleBackToMainChart} 
                className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-150 text-sm"
              >
                &larr; Voltar para Visão Geral
              </button>
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                Distribuição de Proficiência para {selectedSkill}
              </h3>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={drilldownChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} barGap={0}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} stroke="#94a3b8" />
                  <XAxis dataKey="name" tick={{ fill: '#e2e8f0' }} axisLine={{ stroke: '#475569' }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#e2e8f0' }} axisLine={{ stroke: '#475569' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      borderColor: 'rgba(51, 65, 85, 0.5)', 
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }} 
                    labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '4px' }} 
                    itemStyle={{ color: '#cbd5e1', padding: '4px 0' }}
                    cursor={false}
                  />
                  <Legend wrapperStyle={{ color: '#fff', paddingTop: '10px' }} />
                  <Bar dataKey="count" name="Profissionais" radius={[4, 4, 0, 0]} barSize={40} fill="#3b82f6">
                    {drilldownChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        onClick={() => handleProficiencyClick(entry.name)}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            // Mensagem se não houver dados de proficiência para a skill
            <div className="text-center py-10">
               <button 
                onClick={handleBackToMainChart} 
                className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-150 text-sm"
              >
                &larr; Voltar para Visão Geral
              </button>
              <h3 className="text-xl font-semibold text-white mb-6 text-center">
                Distribuição de Proficiência para {selectedSkill}
              </h3>
              <p className="text-slate-400 text-lg">
                Não há dados de proficiência (Júnior, Pleno, Sênior, Especialista) para a skill "{selectedSkill}".
              </p>
              <p className="text-slate-500 mt-2">
                Isso pode significar que todos os profissionais têm "Sem conhecimento" ou nenhum nível especificado para esta skill.
              </p>
            </div>
          )
        )}

        {/* Lista de Profissionais */}
        {!loadingChart && !errorChart && selectedSkill && selectedProficiencyLevel && (
          <div className="mt-8">
            <button 
              onClick={handleBackToDrilldownChart} 
              className="mb-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-150 text-sm"
            >
              &larr; Voltar para Gráfico de Proficiência ({selectedSkill})
            </button>
            <h3 className="text-xl font-semibold text-white mb-4">
              Profissionais com {selectedSkill} - Nível: {selectedProficiencyLevel}
            </h3>
            {loadingProfessionalsList && <p className="text-slate-300">Carregando lista de profissionais...</p>}
            {!loadingProfessionalsList && professionalsList.length === 0 && (
              <p className="text-slate-400">Nenhum profissional encontrado para esta skill e nível.</p>
            )}
            {!loadingProfessionalsList && professionalsList.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg max-h-96 overflow-y-auto">
                <ul className="space-y-3">
                  {professionalsList.map((prof, index) => (
                    <li key={index} className="p-3 bg-slate-700/50 rounded-md shadow">
                      <p className="font-medium text-sky-300">{formatName(prof.nome_completo || '')}</p>
                      <p className="text-sm text-slate-400">{prof.email}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Casos de 'nenhum dado encontrado' para gráficos */}
        {!loadingChart && !errorChart && !selectedProficiencyLevel && (
          (!selectedSkill && mainSkillsChartData.length === 0) || 
          (selectedSkill && drilldownChartData.length === 0)
        ) && (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">Nenhum dado encontrado para a seleção atual.</p>
              <p className="text-slate-400">Verifique os filtros ou adicione mais profissionais.</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('manual')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center space-x-3">
            <UserPlus className="h-6 w-6" />
            <span className="text-lg">Cadastrar Manualmente</span>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('excel')}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center space-x-3">
            <Upload className="h-6 w-6" />
            <span className="text-lg">Importar do Excel</span>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => exportToExcel(professionals)}
          className="bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center space-x-3">
            <BarChart3 className="h-6 w-6" />
            <span className="text-lg">Exportar para Excel</span>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Dashboard;
