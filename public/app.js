// ===== Variables globales =====
let estudianteActual = null;
let tipoDocumento, numeroDocumento, btnBuscar, loading, errorMessage;
let studentSection, btnGenerar, motivo, resultSection, btnDescargar, btnNueva;

// ===== Inicialización cuando el DOM está listo =====
document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos del DOM
    tipoDocumento = document.getElementById('tipoDocumento');
    numeroDocumento = document.getElementById('numeroDocumento');
    btnBuscar = document.getElementById('btnBuscar');
    loading = document.getElementById('loading');
    errorMessage = document.getElementById('errorMessage');
    studentSection = document.getElementById('studentSection');
    btnGenerar = document.getElementById('btnGenerar');
    motivo = document.getElementById('motivo');
    resultSection = document.getElementById('resultSection');
    btnDescargar = document.getElementById('btnDescargar');
    btnNueva = document.getElementById('btnNueva');

    // Verificar que todos los elementos existen
    if (!numeroDocumento || !btnBuscar || !loading || !errorMessage) {
        console.error('Error: No se encontraron elementos del DOM necesarios');
        return;
    }

    // Cargar estadísticas
    cargarEstadisticas();

    // Enfocar campo de búsqueda
    numeroDocumento.focus();

    // Event Listeners
    btnBuscar.addEventListener('click', buscarEstudiante);
    numeroDocumento.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') buscarEstudiante();
    });

    if (btnGenerar) {
        btnGenerar.addEventListener('click', generarConstancia);
    }
    if (btnNueva) {
        btnNueva.addEventListener('click', reiniciarFormulario);
    }
});

// ===== Funciones =====

async function cargarEstadisticas() {
    try {
        const response = await fetch('/api/estadisticas');
        const data = await response.json();
        
        const statEstudiantes = document.getElementById('statEstudiantes');
        const statMatriculas = document.getElementById('statMatriculas');
        const statConstancias = document.getElementById('statConstancias');

        if (statEstudiantes) statEstudiantes.textContent = data.totalEstudiantes;
        if (statMatriculas) statMatriculas.textContent = data.totalMatriculasActivas;
        if (statConstancias) statConstancias.textContent = data.totalConstanciasEmitidas;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

async function buscarEstudiante() {
    const doc = numeroDocumento.value.trim();
    
    if (!doc) {
        mostrarError('Por favor ingrese el número de documento');
        return;
    }

    mostrarLoading(true);
    ocultarError();
    studentSection.classList.add('hidden');
    resultSection.classList.add('hidden');

    try {
        const response = await fetch('/api/estudiantes/buscar?documento=' + encodeURIComponent(doc));
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al buscar estudiante');
        }

        estudianteActual = data;
        mostrarInformacionEstudiante(data);
        studentSection.classList.remove('hidden');

    } catch (error) {
        mostrarError(error.message);
    } finally {
        mostrarLoading(false);
    }
}

function mostrarInformacionEstudiante(est) {
    const studentName = document.getElementById('studentName');
    const studentLastname = document.getElementById('studentLastname');
    const studentDoc = document.getElementById('studentDoc');
    const studentGrade = document.getElementById('studentGrade');
    const studentSectionEl = document.getElementById('studentSection');
    const studentYear = document.getElementById('studentYear');
    const statusEl = document.getElementById('studentStatus');

    if (studentName) studentName.textContent = est.nombres;
    if (studentLastname) studentLastname.textContent = est.apellido_paterno + ' ' + est.apellido_materno;
    if (studentDoc) studentDoc.textContent = est.tipo_documento + ': ' + est.numero_documento;
    if (studentGrade) studentGrade.textContent = est.grado_nombre ? est.grado_nombre + ' - ' + est.nivel_nombre : 'Sin matrícula activa';
    const studentSeccion = document.getElementById('studentSeccion');
    if (studentSeccion) studentSeccion.textContent = est.seccion || '-';
    if (studentYear) studentYear.textContent = est.anio_escolar || '-';
    
    if (statusEl) {
        statusEl.textContent = est.estado_matricula || 'N/A';
        statusEl.className = 'value status-badge ' + (est.estado_matricula || '');
    }
}

async function generarConstancia() {
    if (!estudianteActual) return;

    btnGenerar.disabled = true;
    btnGenerar.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div> Generando...';

    try {
        const response = await fetch('/api/constancias/generar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                estudiante_id: estudianteActual.id,
                motivo: motivo.value.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al generar constancia');
        }

        mostrarResultado(data);
        cargarEstadisticas();

    } catch (error) {
        mostrarError(error.message);
    } finally {
        btnGenerar.disabled = false;
        btnGenerar.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg> Generar Constancia PDF';
    }
}

function mostrarResultado(data) {
    const resultMessage = document.getElementById('resultMessage');
    if (resultMessage) {
        resultMessage.textContent = 'La constancia ha sido generada con el código: ' + data.codigo;
    }
    if (btnDescargar) {
        btnDescargar.href = data.pdf;
    }
    
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function reiniciarFormulario() {
    numeroDocumento.value = '';
    motivo.value = '';
    studentSection.classList.add('hidden');
    resultSection.classList.add('hidden');
    ocultarError();
    numeroDocumento.focus();
}

// ===== Utilidades =====
function mostrarLoading(show) {
    loading.classList.toggle('hidden', !show);
    btnBuscar.disabled = show;
}

function mostrarError(mensaje) {
    errorMessage.textContent = mensaje;
    errorMessage.classList.remove('hidden');
}

function ocultarError() {
    errorMessage.classList.add('hidden');
}
