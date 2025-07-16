import ExcelJS from 'exceljs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateExcel() {
  try {
    // Buscar dados do Supabase
    const { data: professionals, error } = await supabase
      .from('profissionais')
      .select('*');

    if (error) {
      throw error;
    }

    if (!professionals || professionals.length === 0) {
      console.log('Nenhum profissional encontrado');
      return;
    }

    // Criar novo workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Profissionais');

    // Definir colunas
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

    // Adicionar dados
    professionals.forEach(professional => {
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

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Salvar arquivo
    const outputPath = path.join(__dirname, 'profissionais_exportados.xlsx');
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Arquivo Excel gerado com sucesso em: ${outputPath}`);

  } catch (error) {
    console.error('Erro ao gerar arquivo Excel:', error);
    throw error;
  }
}

generateExcel(); 