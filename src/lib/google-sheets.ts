import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export class GoogleSheetsService {
  private doc: GoogleSpreadsheet;

  constructor() {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      // Reemplazamos \n literales si existen en la variable de entorno
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) {
      throw new Error("GOOGLE_SHEET_ID no está configurado en .env.local");
    }

    this.doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);
  }

  // Método para cargar la información del documento
  async init() {
    await this.doc.loadInfo();
  }

  // Ejemplo: Obtener todos los Asesores (para validar login)
  async getAsesores() {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Asesores'];
    if (!sheet) {
      throw new Error("No se encontró la hoja 'Asesores'");
    }
    const rows = await sheet.getRows();
    return rows.map(row => ({
      correo: row.get('Correo'),
      nombre: row.get('Nombre'),
      campus: row.get('Campus'),
      rol: row.get('Rol'),
      activo: String(row.get('Activo')).trim().toLowerCase() === 'verdadero' || String(row.get('Activo')).trim().toLowerCase() === 'true' || String(row.get('Activo')).trim().toLowerCase() === 'sí' || String(row.get('Activo')).trim().toLowerCase() === 'si' || String(row.get('Activo')).trim() === '1',
    }));
  }

  // Ejemplo: Obtener Leads
  async getLeads() {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Leads'];
    if (!sheet) {
      throw new Error("No se encontró la hoja 'Leads'");
    }
    const rows = await sheet.getRows();
    const validRows = rows.filter(r => r.get('ID Lead') || r.get('Prospecto'));
    return validRows.map(row => ({
      idLead: row.get('ID Lead'),
      fecha: row.get('Fecha'),
      prospecto: row.get('Prospecto'),
      celular: row.get('Celular'),
      correo: row.get('Correo'),
      campusInteres: row.get('Campus de Interés'),
      carrera: row.get('Carrera'),
      modalidad: row.get('Modalidad'),
      turno: row.get('Turno'),
      periodoInteres: row.get('Periodo de Interés'),
      año: row.get('Año'),
      medio: row.get('Medio'),
      asesor: row.get('Asesor'),
      etapa: row.get('Etapa'),
      comentario: row.get('Comentario'),
      ultimaActualizacion: row.get('Fecha de última actualización'),
      statusLead: row.get('Status Lead'),
      folioPapeleria: row.get('Folio de Pago Papeleria'),
      montoPapeleria: row.get('Monto Papelería'),
      folioColegiatura: row.get('Folio de Pago Colegiatura'),
      montoColegiatura: row.get('Monto Colegiatura'),
      turnoAsignado: row.get('Turno Asignado'),
      carreraAsignada: row.get('Carrera Asignada'),
      statusColegiatura: row.get('Status Colegiatura')
    }));
  }

  // Obtener catálogos para los formularios
  async getCampus() {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Campus'];
    if (!sheet) return [];
    const rows = await sheet.getRows();
    return rows.filter(r => {
      const act = String(r.get('Activo')).trim().toLowerCase();
      return act === 'verdadero' || act === 'true' || act === 'sí' || act === 'si' || act === '1';
    }).map(r => r.get('Campus'));
  }

  async getCarreras() {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Carreras'];
    if (!sheet) return [];
    const rows = await sheet.getRows();
    return rows.filter(r => {
      const act = String(r.get('Activo')).trim().toLowerCase();
      return act === 'verdadero' || act === 'true' || act === 'sí' || act === 'si' || act === '1';
    }).map(r => r.get('Carrera'));
  }

  async getModalidades() {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Modalidades'];
    if (!sheet) return [];
    const rows = await sheet.getRows();
    const activas = rows.filter(r => {
      const act = String(r.get('Activo')).trim().toLowerCase();
      return act === 'verdadero' || act === 'true' || act === 'sí' || act === 'si' || act === '1';
    }).map(r => r.get('Modalidad'));
    // Eliminar duplicados para que "Mixto" solo salga una vez
    return Array.from(new Set(activas));
  }

  async getTurnos() {
    return ['Matutino', 'Vespertino', 'Nocturno', 'Sabatino', 'Dominical'];
  }

  async getMedios() {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Medios'];
    if (!sheet) return [];
    const rows = await sheet.getRows();
    return rows.filter(r => {
      const act = String(r.get('Activo')).trim().toLowerCase();
      return act === 'verdadero' || act === 'true' || act === 'sí' || act === 'si' || act === '1';
    }).map(r => r.get('Medio'));
  }

  // Agregar un nuevo Lead
  async addLead(leadData: any) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Leads'];
    if (!sheet) throw new Error("No se encontró la hoja 'Leads'");

    // Forzar lectura de encabezados por si el usuario acaba de agregar columnas
    await sheet.loadHeaderRow();

    // Generar ID de forma simple: L-Timestamp
    const newId = `L-${Date.now()}`;
    const fechaActual = new Date().toLocaleDateString('es-MX');

    await sheet.addRow({
      'ID Lead': newId,
      'Fecha': fechaActual,
      'Prospecto': leadData.prospecto,
      'Celular': leadData.celular,
      'Correo': leadData.correo,
      'Campus de Interés': leadData.campusInteres,
      'Carrera': leadData.carrera,
      'Modalidad': leadData.modalidad,
      'Turno': leadData.turno,
      'Periodo de Interés': leadData.periodoInteres,
      'Año': leadData.año, // <-- NUEVO CAMPO AÑO
      'Medio': leadData.medio,
      'Asesor': leadData.asesor,
      'Etapa': 'Nuevo lead',
      'Comentario': leadData.comentario,
      'Fecha de última actualización': fechaActual,
      'Status Lead': 'Nuevo lead'
    });

    return newId;
  }

  // Obtener un Lead específico por su ID
  async getLeadById(idLead: string) {
    const leads = await this.getLeads();
    return leads.find(l => l.idLead === idLead) || null;
  }

  // Actualizar el estatus de un Lead
  async updateLeadStatus(idLead: string, newStatus: string) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Leads'];
    if (!sheet) return false;

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('ID Lead') === idLead);
    
    if (row) {
      row.set('Status Lead', newStatus);
      row.set('Fecha de última actualización', new Date().toLocaleDateString('es-MX'));
      await row.save();
      return true;
    }
    return false;
  }

  // Pre-inscribir un Lead (Etapa 1 - Guarda papelería y turno final)
  async preInscribirLead(idLead: string, data: any) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Leads'];
    if (!sheet) return false;

    // Cargar encabezados para reconocer las nuevas columnas
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('ID Lead') === idLead);
    
    if (row) {
      row.set('Status Lead', 'Pre-inscrito');
      row.set('Fecha de última actualización', new Date().toLocaleDateString('es-MX'));
      
      // Guardar las nuevas 4 columnas de la Etapa 1
      row.set('Folio de Pago Papeleria', data.folioPapeleria);
      row.set('Monto Papelería', data.montoPapeleria);
      row.set('Carrera Asignada', data.carreraAsignada);
      row.set('Turno Asignado', data.turnoAsignado);
      
      await row.save();
      return true;
    }
    return false;
  }

  // Completar Inscripción (Etapa 2 - Guarda colegiatura y resolución)
  async completarInscripcionLead(idLead: string, data: any) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Leads'];
    if (!sheet) return false;

    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('ID Lead') === idLead);
    
    if (row) {
      // Si la decisión fue positiva
      if (data.statusColegiatura === "Convenio de Pago Primera colegiatura" || data.statusColegiatura === "Pago Completado") {
        row.set('Status Lead', 'Inscrito');
      } else {
        // Si pidió devolución o decidió no continuar
        row.set('Status Lead', 'Baja');
      }
      
      row.set('Fecha de última actualización', new Date().toLocaleDateString('es-MX'));
      row.set('Folio de Pago Colegiatura', data.folioColegiatura);
      row.set('Monto Colegiatura', data.montoColegiatura);
      row.set('Status Colegiatura', data.statusColegiatura);
      
      await row.save();
      return true;
    }
    return false;
  }

  // Obtener todos los seguimientos
  async getAllSeguimientos() {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Seguimientos'];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    const validRows = rows.filter(r => r.get('ID Seguimiento') || r.get('ID Lead') || r.get('Comentario'));
    return validRows.map(row => ({
      idSeguimiento: row.get('ID Seguimiento'),
      idLead: row.get('ID Lead'),
      fecha: row.get('Fecha seguimiento'),
      tipoContacto: row.get('Medio contacto'),
      comentario: row.get('Comentario'),
      resultado: row.get('Resultado'),
      proximaAccion: row.get('Próxima acción'),
      fechaProxima: row.get('Fecha próxima acción'),
      asesor: row.get('Asesor')
    })).reverse();
  }

  // Obtener seguimientos de un Lead
  async getSeguimientos(idLead: string) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Seguimientos'];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows
      .filter(r => r.get('ID Lead') === idLead && (r.get('ID Seguimiento') || r.get('Comentario')))
      .map(row => ({
        idSeguimiento: row.get('ID Seguimiento'),
        idLead: row.get('ID Lead'),
        fecha: row.get('Fecha seguimiento'),
        tipoContacto: row.get('Medio contacto'),
        comentario: row.get('Comentario'),
        resultado: row.get('Resultado'),
        proximaAccion: row.get('Próxima acción'),
        fechaProxima: row.get('Fecha próxima acción'),
        asesor: row.get('Asesor')
      }))
      .reverse(); // Para que salgan los más nuevos primero
  }

  // Agregar un Seguimiento
  async addSeguimiento(data: any) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Seguimientos'];
    if (!sheet) throw new Error("No se encontró la hoja 'Seguimientos'");

    const newId = `S-${Date.now()}`;
    
    await sheet.addRow({
      'ID Seguimiento': newId,
      'ID Lead': data.idLead,
      'Fecha seguimiento': new Date().toLocaleDateString('es-MX') + ' ' + new Date().toLocaleTimeString('es-MX'),
      'Medio contacto': data.tipoContacto,
      'Comentario': data.comentario,
      'Resultado': data.resultado,
      'Próxima acción': data.proximaAccion,
      'Fecha próxima acción': data.fechaProxima,
      'Asesor': data.asesor
    });

    // Actualizar también la fecha de última actualización en el Lead principal y su estatus si es necesario
    await this.updateLeadStatus(data.idLead, data.nuevoEstatus || 'En seguimiento');

    return newId;
  }

  // Actualizar un Seguimiento existente
  async updateSeguimiento(idSeguimiento: string, data: any) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Seguimientos'];
    if (!sheet) return false;

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('ID Seguimiento') === idSeguimiento);
    
    if (row) {
      row.set('Medio contacto', data.tipoContacto);
      row.set('Comentario', data.comentario);
      row.set('Resultado', data.resultado);
      row.set('Próxima acción', data.proximaAccion);
      row.set('Fecha próxima acción', data.fechaProxima);
      await row.save();
      return true;
    }
    return false;
  }

  // ----- MÓDULO DE INSCRITOS Y GRUPOS -----

  async getInscritos() {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Inscritos'];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows.map(row => ({
      idInscrito: row.get('ID Inscrito'),
      idLead: row.get('ID Lead'),
      prospecto: row.get('Prospecto'),
      campus: row.get('Campus'),
      carrera: row.get('Carrera'),
      modalidad: row.get('Modalidad'),
      turno: row.get('Turno'),
      periodo: row.get('Periodo'),
      año: row.get('Año'),
      asesor: row.get('Asesor'),
      folioPago: row.get('Folio de Pago'),
      montoPagadoPapeleria: row.get('Monto Pagado Manejo Papeleria') || row.get('Monto Pagado'),
      montoPagadoInscripcion: row.get('Monto Pagado Inscripcion'),
      aplicaComision: row.get('Aplica Comisión'),
      fechaInscripcion: row.get('Fecha inscripción') || row.get('Fecha de inscripción') || row.get('fecha de inscripcion') || row.get('Fecha Inscripción') || row.get('Fecha de Inscripción')
    }));
  }

  async addInscrito(data: any) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Inscritos'];
    if (!sheet) throw new Error("No se encontró la hoja 'Inscritos'");

    // Forzar la recarga de encabezados para reconocer nuevas columnas
    await sheet.loadHeaderRow();

    const newId = `INS-${Date.now()}`;
    const fechaActual = new Date().toLocaleDateString('es-MX');
    
    await sheet.addRow({
      'ID Inscrito': newId,
      'ID Lead': data.idLead,
      'Prospecto': data.prospecto,
      'Campus': data.campus,
      'Carrera': data.carrera,
      'Modalidad': data.modalidad,
      'Turno': data.turno,
      'Periodo': data.periodo,
      'Año': data.año,
      'Asesor': data.asesor,
      'Folio de Pago': data.folioPago,
      'Monto Pagado Manejo Papeleria': data.montoPagadoPapeleria,
      'Monto Pagado Inscripcion': data.montoPagadoInscripcion,
      'Monto Pagado': data.montoPagadoPapeleria, // Fallback por si acaso
      'Aplica Comisión': data.aplicaComision,
      'Fecha inscripción': fechaActual,
      'Fecha de inscripción': fechaActual,
      'Fecha Inscripción': fechaActual
    });

    // Automáticamente cambiar el estatus del Lead original a Inscrito
    await this.updateLeadStatus(data.idLead, 'Inscrito');

    return newId;
  }
  // Actualizar un inscrito (solo campos generales)
  async updateInscrito(idInscrito: string, data: any) {
    await this.init();
    const sheet = this.doc.sheetsByTitle['Inscritos'];
    if (!sheet) return false;

    await sheet.loadHeaderRow(); // Asegurarnos de tener los headers frescos, especialmente "Año" y "Periodo"

    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('ID Inscrito') === idInscrito);
    
    if (row) {
      if (data.prospecto) row.set('Prospecto', data.prospecto);
      if (data.campus) row.set('Campus', data.campus);
      if (data.carrera) row.set('Carrera', data.carrera);
      if (data.modalidad) row.set('Modalidad', data.modalidad);
      if (data.turno) row.set('Turno', data.turno);
      if (data.periodo) row.set('Periodo', data.periodo);
      if (data.año) row.set('Año', data.año);
      
      await row.save();
      return true;
    }
    return false;
  }
}

export const googleSheets = new GoogleSheetsService();
