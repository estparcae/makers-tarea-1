// ── File Upload & Demo ──
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const dropzone = document.getElementById('dropzone');
const validateBtn = document.getElementById('validateBtn');
const report = document.getElementById('report');
const reportStatus = document.getElementById('reportStatus');
const reportBody = document.getElementById('reportBody');

let uploadedFiles = [];

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function getFileIcon(name) {
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) return '📊';
  if (name.endsWith('.zip')) return '📦';
  if (name.endsWith('.pdf')) return '📄';
  return '📎';
}

function renderFiles() {
  fileList.innerHTML = uploadedFiles.map((f, i) => `
    <div class="file-item">
      <span class="file-name">${getFileIcon(f.name)} ${f.name}</span>
      <span class="file-size">${formatSize(f.size)}</span>
      <button class="file-remove" data-index="${i}">×</button>
    </div>
  `).join('');

  fileList.querySelectorAll('.file-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      uploadedFiles.splice(parseInt(btn.dataset.index), 1);
      renderFiles();
    });
  });

  validateBtn.disabled = uploadedFiles.length === 0;
}

function addFiles(files) {
  for (const file of files) {
    const ext = file.name.toLowerCase();
    if (ext.endsWith('.xlsx') || ext.endsWith('.xls') || ext.endsWith('.zip') || ext.endsWith('.pdf')) {
      if (!uploadedFiles.some(f => f.name === file.name)) {
        uploadedFiles.push(file);
      }
    }
  }
  renderFiles();
}

fileInput.addEventListener('change', (e) => {
  addFiles(e.target.files);
  fileInput.value = '';
});

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  addFiles(e.dataTransfer.files);
});

// ── Simulated Validation ──
validateBtn.addEventListener('click', () => {
  validateBtn.disabled = true;
  validateBtn.textContent = 'Validando...';

  setTimeout(() => {
    generateReport();
    validateBtn.disabled = false;
    validateBtn.textContent = 'Validar paquete';
  }, 2000);
});

function generateReport() {
  const hasExcel = uploadedFiles.some(f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'));
  const hasZip = uploadedFiles.some(f => f.name.endsWith('.zip'));
  const hasPdf = uploadedFiles.some(f => f.name.endsWith('.pdf'));

  const issues = [];

  if (!hasExcel) {
    issues.push({ severity: 'high', text: 'Falta archivo Excel (.xlsx) con la ficha de inventario.' });
  }
  if (!hasZip) {
    issues.push({ severity: 'high', text: 'Falta archivo ZIP con las fotografías de evidencia.' });
  }
  if (!hasPdf) {
    issues.push({ severity: 'medium', text: 'No se encontró PDF de acta/informe. Recomendado para trazabilidad.' });
  }

  if (hasExcel) {
    issues.push(
      { severity: 'medium', text: 'Se detectaron 3 filas sin fotografía asociada (filas 12, 45, 78). Matching por descripción sugiere posibles candidatas con confianza >80%.' },
      { severity: 'low', text: 'Campo "material" en fila 23 dice "cerámica" pero las dimensiones (2.3m × 1.5m) son atípicas para cerámica. Verificar.' },
      { severity: 'low', text: '2 IDs duplicados detectados: ARQ-2024-0156 aparece en filas 34 y 67.' }
    );
  }

  if (hasZip) {
    issues.push(
      { severity: 'medium', text: '15 fotos en el ZIP no coinciden con ningún nombre en el Excel. Se generaron sugerencias de matching basadas en metadatos EXIF y contenido visual.' },
      { severity: 'low', text: '4 imágenes tienen resolución inferior a 300 DPI. Pueden no cumplir estándares de documentación.' }
    );
  }

  if (hasPdf) {
    issues.push(
      { severity: 'low', text: 'El acta PDF menciona 52 piezas, pero el Excel contiene 48 registros. Diferencia de 4 ítems.' }
    );
  }

  const highCount = issues.filter(i => i.severity === 'high').length;
  const medCount = issues.filter(i => i.severity === 'medium').length;

  if (highCount > 0) {
    reportStatus.textContent = `${issues.length} observaciones · ${highCount} críticas`;
    reportStatus.className = 'report-badge error';
  } else if (medCount > 0) {
    reportStatus.textContent = `${issues.length} observaciones · Requiere revisión`;
    reportStatus.className = 'report-badge warning';
  } else {
    reportStatus.textContent = 'Paquete consistente';
    reportStatus.className = 'report-badge success';
  }

  reportBody.innerHTML = issues.map(issue => `
    <div class="report-item">
      <span class="report-severity severity-${issue.severity}">${issue.severity === 'high' ? 'ALTA' : issue.severity === 'medium' ? 'MEDIA' : 'BAJA'}</span>
      <span class="report-text">${issue.text}</span>
    </div>
  `).join('');

  report.hidden = false;
  report.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Header scroll effect ──
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.style.background = 'rgba(11, 11, 13, 0.95)';
  } else {
    header.style.background = 'rgba(11, 11, 13, 0.8)';
  }
});

// ── Smooth reveal on scroll ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .ai-card, .flow-step, .info-item, .control-risk, .bottleneck').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  observer.observe(el);
});
