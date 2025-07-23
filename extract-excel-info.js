import XLSX from 'xlsx';
import fs from 'fs';

// Caminho para o arquivo Excel encontrado
const EXCEL_FILE_PATH = './public/Cadastro Colaboradores - FSW São Paulo(1-110).xlsx';
const OUTPUT_FILE = 'excel-info.txt';

function extractExcelInfo() {
  console.log(`Extraindo informações do arquivo: ${EXCEL_FILE_PATH}`);
  
  try {
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      console.error(`ERRO: Arquivo Excel não encontrado em: ${EXCEL_FILE_PATH}`);
      return;
    }

    // Abrir o arquivo Excel
    const workbook = XLSX.readFile(EXCEL_FILE_PATH, { cellDates: true });
    
    // Obter lista de planilhas
    const sheetNames = workbook.SheetNames;
    
    let output = `Informações do arquivo Excel: ${EXCEL_FILE_PATH}\n\n`;
    output += `Planilhas encontradas: ${sheetNames.join(', ')}\n\n`;
    
    // Para cada planilha, extrair cabeçalhos
    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        output += `Planilha ${sheetName}: Vazia\n`;
        return;
      }
      
      // Primeira linha são os cabeçalhos
      const headers = jsonData[0];
      
      output += `Planilha: ${sheetName}\n`;
      output += `Total de linhas: ${jsonData.length}\n`;
      output += `Cabeçalhos encontrados: ${headers.length}\n`;
      output += `Lista de cabeçalhos:\n`;
      
      headers.forEach((header, index) => {
        output += `  ${index + 1}. ${header}\n`;
      });
      
      // Mostrar exemplo da primeira linha de dados
      if (jsonData.length > 1) {
        const firstRow = jsonData[1];
        output += `\nExemplo (primeira linha de dados):\n`;
        
        headers.forEach((header, index) => {
          const value = firstRow[index];
          output += `  ${header}: ${value !== undefined ? value : 'N/A'}\n`;
        });
      }
      
      output += `\n-----------------------------------\n\n`;
    });
    
    // Salvar informações em um arquivo
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`Informações extraídas e salvas em: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Erro ao extrair informações:', error);
  }
}

// Executar a função
extractExcelInfo();