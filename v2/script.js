import { generateZipFromSql, parseSqlToClass, getClassName } from './main.js';
import { MODEL_TEMPLATE } from './constants.js';

window.addEventListener('DOMContentLoaded', () => {
  const convertBtn = document.getElementById('convertBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const inputField = document.getElementById('inputText');
  const outputField = document.getElementById('outputText');

  convertBtn.addEventListener('click', () => {
    const sql = inputField.value;
    try {
      const parsedProps = parseSqlToClass(sql);
      const className = getClassName(sql);
      const modelPreview = MODEL_TEMPLATE(className, parsedProps);
      outputField.value = modelPreview;
    } catch (err) {
      outputField.value = `// Erro: ${err.message}`;
    }
  });

  downloadBtn.addEventListener('click', async () => {
    const sql = inputField.value;
    const className = getClassName(sql);
    try {
      const blob = await generateZipFromSql(sql);
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${className}.zip`;
      link.click();
    } catch (err) {
      alert("Erro ao gerar o ZIP: " + err.message);
    }
  });
});
