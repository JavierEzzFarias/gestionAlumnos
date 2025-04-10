document.addEventListener('DOMContentLoaded', () => {
    const alumnoModalElement = document.getElementById('alumnoModal');
    const alumnoModal = alumnoModalElement ? new bootstrap.Modal(alumnoModalElement) : null;
    const formAlumno = document.getElementById('formAlumno');
    const tablaAlumnosBody = document.getElementById('tablaAlumnosBody');
    const alumnoIdInput = document.getElementById('alumnoId');
    const nombreInput = document.getElementById('nombre');
    const apellidoInput = document.getElementById('apellido');
    const emailInput = document.getElementById('email');
    const modalTitle = document.getElementById('alumnoModalLabel');
    const btnNuevoAlumno = document.getElementById('btnNuevoAlumno');

    const selectAlumnoNotas = document.getElementById('selectAlumnoNotas');
    const formCargaNotasContainer = document.getElementById('formCargaNotasContainer');
    const nombreAlumnoNotasSpan = document.getElementById('nombreAlumnoNotas');
    const formCargaNotas = document.getElementById('formCargaNotas');
    const tablaNotasAlumnoBody = document.getElementById('tablaNotasAlumno');
    const notaAlumnoIdInput = document.getElementById('notaAlumnoId');
    const selectMateriaNota = document.getElementById('selectMateriaNota');
    const calificacionNotaInput = document.getElementById('calificacionNota');
    const fechaNotaInput = document.getElementById('fechaNota');

    const tablaPromediosBody = document.getElementById('tablaPromediosBody');
    const tablaPromediosMateriaBody = document.getElementById('tablaPromediosMateriaBody');
    const tablaSoloLecturaBody = document.getElementById('tablaSoloLecturaBody');

    const formMateria = document.getElementById('formMateria');
    const nombreMateriaNuevaInput = document.getElementById('nombreMateriaNueva');
    const tablaMateriasBody = document.getElementById('tablaMateriasBody');

    const promedioGeneralChartCtx = document.getElementById('promedioGeneralChart')?.getContext('2d');
    const distribucionChartCtx = document.getElementById('distribucionChart')?.getContext('2d');
    let promedioGeneralChartInstance = null;
    let distribucionChartInstance = null;

    let alumnos = JSON.parse(localStorage.getItem('alumnos')) || [];
    let notas = JSON.parse(localStorage.getItem('notas')) || [];
    let materias = JSON.parse(localStorage.getItem('materias')) || [];

    const guardarDatos = () => {
        localStorage.setItem('alumnos', JSON.stringify(alumnos));
        localStorage.setItem('notas', JSON.stringify(notas));
        localStorage.setItem('materias', JSON.stringify(materias));
    };

    const generarId = (array) => {
        let key = 'id';
        if (array.length > 0) { if (array[0].idNota !== undefined) key = 'idNota'; }
        const ids = array.map(item => item[key]).filter(id => typeof id === 'number');
        return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    };

    const renderTablaAlumnos = () => { if (!tablaAlumnosBody) return; tablaAlumnosBody.innerHTML = ''; alumnos.forEach(alumno => { const row = document.createElement('tr'); row.innerHTML = `<td>${alumno.id}</td><td>${alumno.nombre}</td><td>${alumno.apellido}</td><td>${alumno.email}</td><td><button class="btn btn-sm btn-warning btn-editar" data-id="${alumno.id}" title="Editar"><i class="bi bi-pencil-square"></i></button> <button class="btn btn-sm btn-danger btn-eliminar" data-id="${alumno.id}" title="Eliminar"><i class="bi bi-trash"></i></button></td>`; tablaAlumnosBody.appendChild(row); }); addEventListenersBotonesAlumnos(); };
    const addEventListenersBotonesAlumnos = () => { document.querySelectorAll('.btn-editar').forEach(btn => { btn.removeEventListener('click', handleEditarAlumno); btn.addEventListener('click', handleEditarAlumno); }); document.querySelectorAll('.btn-eliminar').forEach(btn => { btn.removeEventListener('click', handleEliminarAlumno); btn.addEventListener('click', handleEliminarAlumno); }); };
    const handleAgregarEditarAlumno = (event) => { event.preventDefault(); const id = alumnoIdInput.value; const nombre = nombreInput.value.trim(); const apellido = apellidoInput.value.trim(); const email = emailInput.value.trim(); if (!nombre || !apellido || !email) { alert('Por favor, completa todos los campos.'); return; } if (id) { const index = alumnos.findIndex(a => a.id == id); if (index !== -1) { alumnos[index] = { ...alumnos[index], nombre, apellido, email }; } } else { const nuevoAlumno = { id: generarId(alumnos), nombre, apellido, email }; alumnos.push(nuevoAlumno); } guardarDatos(); renderTablaAlumnos(); renderSelectAlumnosNotas(); renderTablasDependientes(); if (alumnoModal) alumnoModal.hide(); if (formAlumno) formAlumno.reset(); if (alumnoIdInput) alumnoIdInput.value = ''; };
    const handleEditarAlumno = (event) => { const id = event.currentTarget.getAttribute('data-id'); const alumno = alumnos.find(a => a.id == id); if (alumno && alumnoModal) { if (modalTitle) modalTitle.textContent = 'Editar Alumno'; if (alumnoIdInput) alumnoIdInput.value = alumno.id; if (nombreInput) nombreInput.value = alumno.nombre; if (apellidoInput) apellidoInput.value = alumno.apellido; if (emailInput) emailInput.value = alumno.email; alumnoModal.show(); } };
    const handleEliminarAlumno = (event) => { const id = event.currentTarget.getAttribute('data-id'); if (confirm(`¿Estás seguro de eliminar al alumno con ID ${id}? Se eliminarán también sus notas.`)) { alumnos = alumnos.filter(a => a.id != id); notas = notas.filter(n => n.alumnoId != id); guardarDatos(); renderTablaAlumnos(); renderSelectAlumnosNotas(); renderTablasDependientes(); } };
    if (btnNuevoAlumno) { btnNuevoAlumno.addEventListener('click', () => { if (modalTitle) modalTitle.textContent = 'Agregar Alumno'; if (formAlumno) formAlumno.reset(); if (alumnoIdInput) alumnoIdInput.value = ''; }); }

    const renderTablaMaterias = () => { if (!tablaMateriasBody) return; tablaMateriasBody.innerHTML = ''; materias.sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(materia => { const row = document.createElement('tr'); row.innerHTML = `<td>${materia.id}</td><td>${materia.nombre}</td><td><button class="btn btn-sm btn-danger btn-eliminar-materia" data-id="${materia.id}" title="Eliminar Materia"><i class="bi bi-trash"></i></button></td>`; tablaMateriasBody.appendChild(row); }); addEventListenersBotonesMaterias(); };
    const addEventListenersBotonesMaterias = () => { document.querySelectorAll('.btn-eliminar-materia').forEach(btn => { btn.removeEventListener('click', handleEliminarMateria); btn.addEventListener('click', handleEliminarMateria); }); };
    const handleAgregarMateria = (event) => { event.preventDefault(); if (!nombreMateriaNuevaInput) return; const nombreMateria = nombreMateriaNuevaInput.value.trim(); if (!nombreMateria) { alert('El nombre de la materia no puede estar vacío.'); return; } const existe = materias.some(m => m.nombre.toLowerCase() === nombreMateria.toLowerCase()); if (existe) { alert(`La materia "${nombreMateria}" ya existe.`); return; } const nuevaMateria = { id: generarId(materias), nombre: nombreMateria }; materias.push(nuevaMateria); guardarDatos(); renderTablaMaterias(); renderSelectMateriasNotas(); if (formMateria) formMateria.reset(); };
    const handleEliminarMateria = (event) => { const idMateria = event.currentTarget.getAttribute('data-id'); const materiaAEliminar = materias.find(m => m.id == idMateria); if (!materiaAEliminar) return; const materiaEnUso = notas.some(nota => nota.materia === materiaAEliminar.nombre); if (materiaEnUso) { alert(`No se puede eliminar la materia "${materiaAEliminar.nombre}" porque ya tiene notas cargadas.`); return; } if (confirm(`¿Estás seguro de eliminar la materia "${materiaAEliminar.nombre}"?`)) { materias = materias.filter(m => m.id != idMateria); guardarDatos(); renderTablaMaterias(); renderSelectMateriasNotas(); renderTablasDependientes(); } };
    if (formMateria) { formMateria.addEventListener('submit', handleAgregarMateria); }

    const renderSelectAlumnosNotas = () => { if (!selectAlumnoNotas) return; selectAlumnoNotas.innerHTML = '<option selected disabled value="">Elige...</option>'; alumnos.forEach(alumno => { const option = document.createElement('option'); option.value = alumno.id; option.textContent = `${alumno.apellido}, ${alumno.nombre}`; selectAlumnoNotas.appendChild(option); }); if (formCargaNotasContainer) formCargaNotasContainer.style.display = 'none'; if (tablaNotasAlumnoBody) tablaNotasAlumnoBody.innerHTML = ''; };
    const renderSelectMateriasNotas = () => { if (!selectMateriaNota) return; const valorSeleccionado = selectMateriaNota.value; selectMateriaNota.innerHTML = '<option value="" selected disabled>Selecciona una materia...</option>'; materias.sort((a,b) => a.nombre.localeCompare(b.nombre)).forEach(materia => { const option = document.createElement('option'); option.value = materia.nombre; option.textContent = materia.nombre; selectMateriaNota.appendChild(option); }); if (materias.some(m => m.nombre === valorSeleccionado)) { selectMateriaNota.value = valorSeleccionado; } };
    const renderTablaNotas = (alumnoIdSeleccionado) => { if (!tablaNotasAlumnoBody) return; tablaNotasAlumnoBody.innerHTML = ''; const notasAlumno = notas.filter(n => n.alumnoId == alumnoIdSeleccionado); if (notasAlumno.length === 0) { tablaNotasAlumnoBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay notas cargadas.</td></tr>'; return; } notasAlumno.forEach(nota => { const row = document.createElement('tr'); let fechaFormateada = 'N/A'; if (nota.fecha) { try { const dateObj = new Date(nota.fecha); dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset()); fechaFormateada = dateObj.toLocaleDateString(undefined, { timeZone: 'UTC' }); } catch (e) { fechaFormateada = nota.fecha; } } row.innerHTML = `<td>${nota.materia}</td><td>${nota.calificacion}</td><td>${fechaFormateada}</td><td><button class="btn btn-sm btn-danger btn-eliminar-nota" data-id="${nota.idNota}" title="Eliminar Nota"><i class="bi bi-x-circle"></i></button></td>`; tablaNotasAlumnoBody.appendChild(row); }); addEventListenersBotonesNotas(); };
    const addEventListenersBotonesNotas = () => { document.querySelectorAll('.btn-eliminar-nota').forEach(btn => { btn.removeEventListener('click', handleEliminarNota); btn.addEventListener('click', handleEliminarNota); }); }
    const handleEliminarNota = (event) => { const idNota = event.currentTarget.getAttribute('data-id'); const alumnoIdActual = selectAlumnoNotas ? selectAlumnoNotas.value : null; if(confirm(`¿Estás seguro de eliminar esta nota?`)) { notas = notas.filter(n => n.idNota != idNota); guardarDatos(); if (alumnoIdActual) renderTablaNotas(alumnoIdActual); renderTablasDependientes(); } };
    if (selectAlumnoNotas) { selectAlumnoNotas.addEventListener('change', (event) => { const alumnoIdSeleccionado = event.target.value; if(alumnoIdSeleccionado) { const alumno = alumnos.find(a => a.id == alumnoIdSeleccionado); if (nombreAlumnoNotasSpan && alumno) nombreAlumnoNotasSpan.textContent = `${alumno.apellido}, ${alumno.nombre}`; if (notaAlumnoIdInput) notaAlumnoIdInput.value = alumnoIdSeleccionado; if (formCargaNotasContainer) formCargaNotasContainer.style.display = 'block'; if (formCargaNotas) formCargaNotas.reset(); renderTablaNotas(alumnoIdSeleccionado); } else { if (formCargaNotasContainer) formCargaNotasContainer.style.display = 'none'; } }); }
    if (formCargaNotas) { formCargaNotas.addEventListener('submit', (event) => { event.preventDefault(); const alumnoId = notaAlumnoIdInput ? notaAlumnoIdInput.value : null; const materia = selectMateriaNota ? selectMateriaNota.value : ''; const calificacion = calificacionNotaInput ? parseFloat(calificacionNotaInput.value) : NaN; const fecha = fechaNotaInput ? fechaNotaInput.value : ''; if (!alumnoId || !materia || isNaN(calificacion) || !fecha) { alert('Completa todos los campos, incluyendo la selección de una materia.'); return; } const nuevaNota = { idNota: generarId(notas), alumnoId: parseInt(alumnoId), materia, calificacion, fecha }; notas.push(nuevaNota); guardarDatos(); renderTablaNotas(alumnoId); if (selectMateriaNota) selectMateriaNota.value = ""; if (calificacionNotaInput) calificacionNotaInput.value = ""; if (fechaNotaInput) fechaNotaInput.value = ""; if (selectMateriaNota) selectMateriaNota.focus(); renderTablasDependientes(); }); }

    const calcularPromedioAlumno = (alumnoId) => { const notasAlumno = notas.filter(n => n.alumnoId == alumnoId); if (notasAlumno.length === 0) return 0; const suma = notasAlumno.reduce((acc, nota) => acc + nota.calificacion, 0); return (suma / notasAlumno.length).toFixed(2); };
    const renderTablaPromedios = () => { if (!tablaPromediosBody) return; tablaPromediosBody.innerHTML = ''; alumnos.forEach(alumno => { const promedio = calcularPromedioAlumno(alumno.id); const row = document.createElement('tr'); row.innerHTML = `<td>${alumno.id}</td><td>${alumno.apellido}, ${alumno.nombre}</td><td>${promedio}</td>`; tablaPromediosBody.appendChild(row); }); };
    const calcularPromediosPorMateria = () => { const promediosMateria = {}; notas.forEach(nota => { if (nota.materia && typeof nota.calificacion === 'number' && !isNaN(nota.calificacion)) { const materiaNormalizada = nota.materia.trim(); if (!materiaNormalizada) return; if (!promediosMateria[materiaNormalizada]) { promediosMateria[materiaNormalizada] = { suma: 0, cantidad: 0 }; } promediosMateria[materiaNormalizada].suma += nota.calificacion; promediosMateria[materiaNormalizada].cantidad++; } }); const resultados = Object.keys(promediosMateria).map(materia => { const data = promediosMateria[materia]; return { materia: materia, cantidad: data.cantidad, promedio: (data.suma / data.cantidad).toFixed(2) }; }).sort((a, b) => a.materia.localeCompare(b.materia)); return resultados; };
    const renderTablaPromediosMateria = () => { if (!tablaPromediosMateriaBody) return; const promediosData = calcularPromediosPorMateria(); tablaPromediosMateriaBody.innerHTML = ''; if (promediosData.length === 0) { tablaPromediosMateriaBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No hay notas cargadas.</td></tr>'; return; } promediosData.forEach(item => { const row = document.createElement('tr'); row.innerHTML = `<td>${item.materia}</td><td class="text-center">${item.cantidad}</td><td class="text-center fw-bold">${item.promedio}</td>`; tablaPromediosMateriaBody.appendChild(row); }); };
    const renderTablaSoloLectura = () => { if (!tablaSoloLecturaBody) return; tablaSoloLecturaBody.innerHTML = ''; alumnos.forEach(alumno => { const promedio = calcularPromedioAlumno(alumno.id); const row = document.createElement('tr'); row.innerHTML = `<td>${alumno.id}</td><td>${alumno.nombre}</td><td>${alumno.apellido}</td><td>${alumno.email}</td><td>${promedio}</td>`; tablaSoloLecturaBody.appendChild(row); }); };
    const calcularPromedioGeneral = () => { if (alumnos.length === 0) return 0; let sumaPromedios = 0; let alumnosConNotas = 0; alumnos.forEach(alumno => { if (notas.some(n => n.alumnoId == alumno.id)) { const prom = parseFloat(calcularPromedioAlumno(alumno.id)); if (!isNaN(prom)) { sumaPromedios += prom; alumnosConNotas++;} } }); return alumnosConNotas > 0 ? (sumaPromedios / alumnosConNotas).toFixed(2) : 0; }
    const renderDashboard = () => { if (promedioGeneralChartCtx) { const promedioGeneral = calcularPromedioGeneral(); if (promedioGeneralChartInstance) { promedioGeneralChartInstance.destroy(); } promedioGeneralChartInstance = new Chart(promedioGeneralChartCtx, { type: 'bar', data: { labels: ['Promedio General'], datasets: [{ label: 'Promedio', data: [promedioGeneral], backgroundColor: ['rgba(54, 162, 235, 0.6)'], borderColor: ['rgba(54, 162, 235, 1)'], borderWidth: 1 }] }, options: { indexAxis: 'y', scales: { x: { beginAtZero: true, max: 10 } }, plugins: { legend: { display: false }, title: { display: true, text: `Promedio General: ${promedioGeneral}` } } } }); } if (distribucionChartCtx) { const rangos = { '0-3.9': 0, '4-5.9': 0, '6-7.9': 0, '8-10': 0, 'Sin Notas': 0 }; let alumnosSinNotasCount = 0; alumnos.forEach(alumno => { if (!notas.some(n => n.alumnoId == alumno.id)) { alumnosSinNotasCount++; return; } const prom = parseFloat(calcularPromedioAlumno(alumno.id)); if (prom < 4) { rangos['0-3.9']++; } else if (prom < 6) { rangos['4-5.9']++; } else if (prom < 8) { rangos['6-7.9']++; } else { rangos['8-10']++; } }); rangos['Sin Notas'] = alumnosSinNotasCount; if (distribucionChartInstance) { distribucionChartInstance.destroy(); } distribucionChartInstance = new Chart(distribucionChartCtx, { type: 'pie', data: { labels: Object.keys(rangos), datasets: [{ label: 'Distribución', data: Object.values(rangos), backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(153, 102, 255, 0.6)'], borderColor: ['#FFF'], borderWidth: 1 }] }, options: { responsive: true, plugins: { legend: { position: 'top', }, title: { display: true, text: 'Distribución de Promedios' } } } }); } };
    const renderTablasDependientes = () => { renderTablaPromedios(); renderTablaSoloLectura(); renderDashboard(); renderTablaPromediosMateria(); }

    if (formAlumno) { formAlumno.addEventListener('submit', handleAgregarEditarAlumno); }

    renderTablaAlumnos();
    renderSelectAlumnosNotas();
    renderTablaMaterias();
    renderSelectMateriasNotas();
    renderTablasDependientes();

    const tabs = document.querySelectorAll('#menuTabs .nav-link[data-bs-toggle="pill"]');
    tabs.forEach(tab => { tab.addEventListener('shown.bs.tab', event => { if (event.target.getAttribute('data-bs-target') === '#dashboard-tab-pane') { setTimeout(() => { if(promedioGeneralChartInstance) promedioGeneralChartInstance.resize(); if(distribucionChartInstance) distribucionChartInstance.resize(); }, 50); } }); });

    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarClose = document.getElementById('sidebarClose');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const mainContent = document.getElementById('mainContent');
    const menuLinks = document.querySelectorAll('#sidebar .nav-link');

    const toggleSidebar = () => {
        if (!sidebar || !sidebarBackdrop) return;
        sidebar.classList.toggle('active');
        sidebarBackdrop.classList.toggle('active');
        if (sidebarBackdrop.classList.contains('active')) { sidebarBackdrop.classList.remove('d-none'); }
        else { setTimeout(() => { if (!sidebarBackdrop.classList.contains('active')) { sidebarBackdrop.classList.add('d-none'); } }, 300); }
        document.body.classList.toggle('sidebar-open');
    };

    if (sidebarToggle) { sidebarToggle.addEventListener('click', toggleSidebar); }
    if (sidebarClose) { sidebarClose.addEventListener('click', toggleSidebar); }
    if (sidebarBackdrop) { sidebarBackdrop.addEventListener('click', toggleSidebar); }

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992 && sidebar && sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        });
    });

});