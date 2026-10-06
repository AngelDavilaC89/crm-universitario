import { NextResponse } from 'next/server';
import { googleSheets } from '@/lib/google-sheets';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Necesitamos que nos manden por POST: fileId, sheetName, campusId, y el colMap
    const { fileId, sheetName, campusId, colMap } = body;

    if (!fileId || !campusId || !colMap || !colMap.prospecto || !colMap.celular) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios (fileId, campusId, o mapeo de celular/prospecto)' }, { status: 400 });
    }

    const inserted = await googleSheets.syncExternalExcelLeads(
      fileId,
      sheetName || 'Sheet1', // fallback
      campusId,
      colMap
    );

    return NextResponse.json({ 
      success: true, 
      message: `Sincronización completada. Se importaron ${inserted} leads nuevos.`,
      inserted
    }, { status: 200 });

  } catch (error: any) {
    console.error("Error sincronizando excel externo:", error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
