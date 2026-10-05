import { NextResponse } from 'next/server';
import { googleSheets } from '@/lib/google-sheets';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    // Validar un secreto para que nadie más pueda meter leads basura
    // Usa la variable de entorno WEBHOOK_SECRET si existe, o un valor por defecto para pruebas
    const expectedSecret = process.env.WEBHOOK_SECRET || 'crm_secret_12345';
    
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();

    // Validar campos mínimos
    if (!body.prospecto || !body.celular) {
      return NextResponse.json({ error: 'Faltan campos obligatorios: prospecto o celular' }, { status: 400 });
    }

    // Insertar el lead en la base central
    const newId = await googleSheets.addLead({
      prospecto: body.prospecto,
      celular: body.celular,
      correo: body.correo || '',
      campusInteres: body.campusInteres || 'Sin campus',
      carrera: body.carrera || '',
      modalidad: body.modalidad || '',
      turno: body.turno || '',
      periodoInteres: body.periodoInteres || '',
      año: body.año || new Date().getFullYear().toString(),
      medio: body.medio || 'Redes Sociales',
      asesor: body.asesor || '', // Se quedará vacío para que un asesor lo tome o asigne
      comentario: body.comentario || 'Lead inyectado automáticamente vía Webhook'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Lead agregado exitosamente al CRM',
      id: newId 
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error en webhook de leads:", error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
