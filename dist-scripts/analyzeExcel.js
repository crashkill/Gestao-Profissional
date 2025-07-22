console.log("Script analyzeExcel.ts started...");
import ExcelJS from 'exceljs';
async function analyzeExcel(filePath) {
    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);
        if (!worksheet) {
            throw new Error('Planilha vazia ou inválida');
        }
        const data = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1)
                return; // Skip header
            const rowData = {
                nome_completo: row.getCell(1).text || '',
                email: row.getCell(2).text || '',
                area_atuacao: row.getCell(3).text || '',
                skill_principal: row.getCell(4).text || '',
                nivel_experiencia: row.getCell(5).text || '',
                gestor_area: row.getCell(6).text || '',
                gestor_direto: row.getCell(7).text || '',
                disponivel_compartilhamento: row.getCell(8).text?.toLowerCase() === 'sim',
                percentual_compartilhamento: Number(row.getCell(9).text) || 0,
                outras_tecnologias: row.getCell(10).text || '',
                regime: row.getCell(11).text || '',
                local_alocacao: row.getCell(12).text || '',
                proficiencia_cargo: row.getCell(13).text || '',
                hora_ultima_modificacao: new Date().toISOString(),
                created_at: new Date().toISOString()
            };
            data.push(rowData);
        });
        return data;
    }
    catch (error) {
        console.error('Erro ao analisar arquivo Excel:', error);
        throw error;
    }
}
export default analyzeExcel;
//# sourceMappingURL=analyzeExcel.js.map