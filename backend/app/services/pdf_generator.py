from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import io
import os
from typing import Optional
from datetime import datetime
from app.models.control_operativo import ControlOperativo

class ControlOperativoPDFGenerator:
    """Generador de PDF para Control Operativo de Consulta Jurídica - Formato exacto según PDF de referencia"""
    
    def __init__(self):
        self.page_width, self.page_height = letter
        self.margins = {
            'left': 0.75 * inch,
            'right': 0.75 * inch,
            'top': 0.4 * inch,
            'bottom': 0.75 * inch
        }
        self.content_width = self.page_width - self.margins['left'] - self.margins['right']
        
        # Configurar estilos
        self.setup_styles()
    
    def setup_styles(self):
        """Configurar estilos de texto según el PDF de referencia"""
        styles = getSampleStyleSheet()
        
        # Estilo para el título principal
        self.title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=12,
            textColor=black,
            alignment=TA_CENTER,
            spaceAfter=12,
            fontName='Helvetica-Bold'
        )
        
        # Estilo para subtítulos universitarios
        self.university_style = ParagraphStyle(
            'UniversityStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=black,
            alignment=TA_CENTER,
            spaceAfter=3,
            fontName='Helvetica-Bold'
        )
        
        # Estilo para subtítulos de sección con fondo gris
        self.section_style = ParagraphStyle(
            'SectionStyle',
            parent=styles['Normal'],
            fontSize=9,
            textColor=black,
            alignment=TA_LEFT,
            spaceAfter=0,
            fontName='Helvetica-Bold',
            leftIndent=3,
            rightIndent=3
        )
        
        # Estilo normal para texto
        self.normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=8,
            textColor=black,
            alignment=TA_LEFT,
            fontName='Helvetica',
            wordWrap='CJK'  # Mejor manejo de salto de línea
        )
        
        # Estilo para texto de áreas de párrafo
        self.paragraph_style = ParagraphStyle(
            'ParagraphStyle',
            parent=styles['Normal'],
            fontSize=8,
            textColor=black,
            alignment=TA_JUSTIFY,
            fontName='Helvetica',
            leading=10,  # Espaciado entre líneas
            wordWrap='CJK',
            leftIndent=0,
            rightIndent=0
        )
        
        # Estilo especial para declaración del usuario (texto más compacto)
        self.declaracion_style = ParagraphStyle(
            'DeclaracionStyle',
            parent=styles['Normal'],
            fontSize=7,  # Tamaño de letra aumentado para mejor legibilidad
            textColor=black,
            alignment=TA_LEFT,  # Alineación izquierda para mejor control
            fontName='Helvetica',
            leading=9,  # Line-height ajustado proporcionalmente
            wordWrap='LTR',  # Word-wrap adecuado para texto en español
            leftIndent=2,
            rightIndent=2,
            spaceBefore=1,
            spaceAfter=1,
            splitLongWords=True,  # Permitir división de palabras largas
            allowWidows=0,  # Evitar líneas huérfanas
            allowOrphans=0  # Evitar líneas viudas
        )
        
        # Estilo para campos pequeños
        self.field_style = ParagraphStyle(
            'FieldStyle',
            parent=styles['Normal'],
            fontSize=7,
            textColor=black,
            alignment=TA_CENTER,
            fontName='Helvetica'
        )

    def generate_pdf(self, control: ControlOperativo) -> io.BytesIO:
        """Generar PDF del control operativo con formato exacto"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=self.margins['right'],
            leftMargin=self.margins['left'],
            topMargin=self.margins['top'],
            bottomMargin=self.margins['bottom']
        )
        
        # Construir contenido
        story = []
        
        # Encabezado oficial exacto
        story.extend(self._build_header())
        
        # I. DATOS DEL USUARIO
        story.extend(self._build_datos_usuario(control))
        
        # II. INFORMACIÓN GENERAL DEL CONSULTANTE
        story.extend(self._build_info_consultante(control))
        
        # III. BREVE DESCRIPCIÓN DEL CASO
        story.extend(self._build_descripcion_caso(control))
        
        # IV. CONCEPTO DEL ESTUDIANTE
        story.extend(self._build_concepto_estudiante(control))
        
        # V. CONCEPTO DEL ASESOR JURÍDICO
        story.extend(self._build_concepto_asesor(control))
        
        # VI. DECLARACIÓN DEL USUARIO
        story.extend(self._build_declaracion_usuario())
        
        # Generar PDF
        doc.build(story)
        buffer.seek(0)
        return buffer

    def _build_header(self):
        """Construir encabezado oficial exacto según PDF de referencia"""
        elements = []
        
        # Intentar agregar el escudo
        try:
            # Buscar el escudo en diferentes ubicaciones posibles
            escudo_paths = [
                '/home/anderson/Escritorio/app-derecho_v1-main/frontend/src/assets/escudo.png',
                '/home/anderson/Escritorio/app-derecho_v1-main/frontend/public/escudo.png',
                os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'escudo.png')
            ]
            
            escudo_path = None
            for path in escudo_paths:
                if os.path.exists(path):
                    escudo_path = path
                    break
            
            if escudo_path and escudo_path.endswith('.png'):
                # Escudo centrado con tamaño original
                escudo = Image(escudo_path, width=1*inch, height=1*inch)
                
                # Crear tabla solo para centrar el escudo
                escudo_data = [[escudo]]
                escudo_table = Table(escudo_data, colWidths=[self.content_width])
                escudo_table.setStyle(TableStyle([
                    ('ALIGN', (0, 0), (0, 0), 'CENTER'),
                    ('VALIGN', (0, 0), (0, 0), 'MIDDLE'),
                ]))
                elements.append(escudo_table)
                elements.append(Spacer(1, 3))
                
                # Después el texto universitario
                elements.append(Paragraph("UNIVERSIDAD COLEGIO MAYOR DE CUNDINAMARCA", self.university_style))
                elements.append(Paragraph("FACULTAD DE DERECHO - CONSULTORIO JURÍDICO", self.university_style))
            else:
                # Solo texto si no hay escudo disponible
                elements.append(Paragraph("UNIVERSIDAD COLEGIO MAYOR DE CUNDINAMARCA", self.university_style))
                elements.append(Paragraph("FACULTAD DE DERECHO - CONSULTORIO JURÍDICO", self.university_style))
        except:
            # Fallback a solo texto
            elements.append(Paragraph("UNIVERSIDAD COLEGIO MAYOR DE CUNDINAMARCA", self.university_style))
            elements.append(Paragraph("FACULTAD DE DERECHO - CONSULTORIO JURÍDICO", self.university_style))
        
        # Centrar el texto institucional
        centered_style = ParagraphStyle(
            'CenteredStyle',
            parent=self.normal_style,
            alignment=TA_CENTER,
            fontSize=9
        )
        
        elements.append(Paragraph("Sede Universidad Pública de Kennedy - Tintal", centered_style))
        elements.append(Paragraph("<i>Aprobado Acuerdo 10/28/2002 Sala de Gobierno RTSJ50 de Bogotá</i>", self.field_style))
        
        elements.append(Spacer(1, 8))
        
        # Título principal
        elements.append(Paragraph("<b>CONTROL OPERATIVO DE CONSULTA JURÍDICA</b>", self.title_style))
        elements.append(Spacer(1, 8))
        
        return elements

    def _build_datos_usuario(self, control: ControlOperativo):
        """I. DATOS DEL USUARIO - Formato exacto"""
        elements = []
        
        # Título de sección con fondo gris
        section_data = [["I.    DATOS DEL USUARIO"]]
        section_table = Table(section_data, colWidths=[self.content_width])
        section_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(section_table)
        
        # Fila 1: Ciudad y fecha
        ciudad_fecha_data = [
            [
                f"Ciudad: {control.ciudad}",
                "Día",
                "Mes", 
                "Año"
            ],
            [
                "",  # Espacio vacío bajo ciudad
                str(control.fecha_dia) if control.fecha_dia else "",
                str(control.fecha_mes) if control.fecha_mes else "",
                str(control.fecha_ano) if control.fecha_ano else ""
            ]
        ]
        
        # Usar proporciones de content_width para consistencia
        col1_width = self.content_width * 0.538  # ~3.5/6.5
        col2_width = self.content_width * 0.154  # ~1/6.5
        col3_width = self.content_width * 0.154  # ~1/6.5
        col4_width = self.content_width * 0.154  # ~1/6.5
        
        fecha_table = Table(ciudad_fecha_data, colWidths=[col1_width, col2_width, col3_width, col4_width])
        fecha_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ('SPAN', (0, 0), (0, 1)),  # Unir celdas de ciudad
        ]))
        elements.append(fecha_table)
        
        # Información del docente, estudiante y área
        info_data = [
            [f"Nombre del Docente Responsable: {control.nombre_docente_responsable or ''}"],
            [f"Nombre del Estudiante: {control.nombre_estudiante or ''}"],
            [f"Área de Consulta: {control.area_consulta or ''}"]
        ]
        
        info_table = Table(info_data, colWidths=[self.content_width])
        info_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(info_table)
        
        elements.append(Spacer(1, 12))
        return elements

    def _build_info_consultante(self, control: ControlOperativo):
        """II. INFORMACIÓN GENERAL DEL CONSULTANTE - Formato exacto"""
        elements = []
        
        # Título de sección
        section_data = [["II.   INFORMACIÓN GENERAL DEL CONSULTANTE"]]
        section_table = Table(section_data, colWidths=[self.content_width])
        section_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(section_table)
        
        # Remitido por y correo electrónico
        primera_fila = [
            [f"Remitido por: {control.remitido_por or ''}"],
            [f"Correo electrónico: {control.correo_electronico or ''}"]
        ]
        
        primera_table = Table(primera_fila, colWidths=[self.content_width])
        primera_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(primera_table)
        
        # Fila con nombre y edad
        nombre_edad_data = [[
            f"1. Nombre: {control.nombre_consultante or ''}",
            f"2. Edad: {control.edad or ''}"
        ]]
        
        # Estandarizar usando proporciones de content_width
        nombre_col_width = self.content_width * 0.615  # ~4/6.5
        edad_col_width = self.content_width * 0.385   # ~2.5/6.5
        
        nombre_edad_table = Table(nombre_edad_data, colWidths=[nombre_col_width, edad_col_width])
        nombre_edad_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(nombre_edad_table)
        
        # Fila de fecha de nacimiento y lugar
        fecha_nac_data = [[
            f"3. Fecha de nacimiento    Día: {control.fecha_nacimiento_dia or ''}    Mes: {control.fecha_nacimiento_mes or ''}    Año: {control.fecha_nacimiento_ano or ''}",
            f"4. Lugar de nacimiento: {control.lugar_nacimiento or ''}",
            f"5. Sexo"
        ]]
        
        # Estandarizar proporciones para fecha de nacimiento
        fecha_nac_col1 = self.content_width * 0.462  # ~3/6.5
        fecha_nac_col2 = self.content_width * 0.308  # ~2/6.5
        fecha_nac_col3 = self.content_width * 0.231  # ~1.5/6.5
        
        fecha_nac_table = Table(fecha_nac_data, colWidths=[fecha_nac_col1, fecha_nac_col2, fecha_nac_col3])
        fecha_nac_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(fecha_nac_table)
        
        # Fila de sexo con checkboxes mejorados
        sexo_data = [[
            "",
            f"Femenino {'✓' if control.sexo == 'Femenino' else '☐'}    Masculino {'✓' if control.sexo == 'Masculino' else '☐'}"
        ]]
        
        # Estandarizar proporciones para sexo
        sexo_col1 = self.content_width * 0.692  # ~4.5/6.5
        sexo_col2 = self.content_width * 0.308  # ~2/6.5
        
        sexo_table = Table(sexo_data, colWidths=[sexo_col1, sexo_col2])
        sexo_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(sexo_table)
        
        # Documento de identidad
        doc_data = [[
            f"7. Número de documento: {control.numero_documento or ''}",
            f"8. Lugar de expedición: {control.lugar_expedicion or ''}"
        ]]
        
        # Estandarizar proporciones para documentos (50/50)
        doc_col_width = self.content_width * 0.5  # Dividir equitativamente
        
        doc_table = Table(doc_data, colWidths=[doc_col_width, doc_col_width])
        doc_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(doc_table)
        
        # Checkboxes para tipo de documento con mejor contraste
        tipo_doc_data = [[
            f"{'✓' if control.tipo_documento == 'T.I.' else '☐'} T.I.    {'✓' if control.tipo_documento == 'C.C.' else '☐'} C.C.    {'✓' if control.tipo_documento == 'NUIP' else '☐'} NUIP",
            ""
        ]]
        
        # Usar misma proporción que doc_table
        tipo_doc_table = Table(tipo_doc_data, colWidths=[doc_col_width, doc_col_width])
        tipo_doc_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(tipo_doc_table)
        
        # Dirección, barrio y estrato
        direccion_data = [[
            f"9. Dirección: {control.direccion or ''}",
            f"10. Barrio: {control.barrio or ''}",
            f"Estrato: {control.estrato or ''}"
        ]]
        
        # Estandarizar proporciones para dirección
        dir_col1 = self.content_width * 0.385  # ~2.5/6.5
        dir_col2 = self.content_width * 0.385  # ~2.5/6.5
        dir_col3 = self.content_width * 0.231  # ~1.5/6.5
        
        direccion_table = Table(direccion_data, colWidths=[dir_col1, dir_col2, dir_col3])
        direccion_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(direccion_table)
        
        # Teléfonos
        telefono_data = [[
            f"11. Número telefónico: {control.numero_telefonico or ''}",
            f"12. Número celular: {control.numero_celular or ''}"
        ]]
        
        # Usar misma proporción que doc_table (50/50)
        telefono_table = Table(telefono_data, colWidths=[doc_col_width, doc_col_width])
        telefono_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(telefono_table)
        
        # Estado civil, escolaridad y profesión
        estado_data = [[
            f"13. Estado civil actual: {control.estado_civil or ''}",
            f"15. Profesión u oficio: {control.profesion_oficio or ''}"
        ]]
        
        # Usar misma proporción que doc_table (50/50)
        estado_table = Table(estado_data, colWidths=[doc_col_width, doc_col_width])
        estado_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(estado_table)
        
        # Escolaridad
        escolaridad_data = [[f"14. Escolaridad: {control.escolaridad or ''}"]]
        
        escolaridad_table = Table(escolaridad_data, colWidths=[self.content_width])
        escolaridad_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(escolaridad_table)
        
        elements.append(Spacer(1, 12))
        return elements

    def _build_descripcion_caso(self, control: ControlOperativo):
        """III. BREVE DESCRIPCIÓN DEL CASO"""
        elements = []
        
        # Título de sección
        section_data = [["III.  BREVE DESCRIPCIÓN DEL CASO"]]
        section_table = Table(section_data, colWidths=[self.content_width])
        section_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 2),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))
        elements.append(section_table)
        
        # Área de texto para descripción - usar Paragraph para mejor manejo del texto
        descripcion_text = control.descripcion_caso or ""
        if descripcion_text.strip():
            descripcion_paragraph = Paragraph(descripcion_text, self.paragraph_style)
        else:
            descripcion_paragraph = Paragraph("&nbsp;", self.paragraph_style)  # Espacio en blanco
        
        data = [[descripcion_paragraph]]
        
        table = Table(data, colWidths=[self.content_width], rowHeights=[2.5*inch])
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(table)
        
        elements.append(Spacer(1, 12))
        return elements

    def _build_concepto_estudiante(self, control: ControlOperativo):
        """IV. CONCEPTO DEL ESTUDIANTE"""
        elements = []
        
        # Título de sección
        section_data = [["IV.  CONCEPTO DEL ESTUDIANTE"]]
        section_table = Table(section_data, colWidths=[self.content_width])
        section_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(section_table)
        
        # Área de texto para concepto del estudiante - usar Paragraph
        concepto_text = control.concepto_estudiante or ""
        if concepto_text.strip():
            concepto_paragraph = Paragraph(concepto_text, self.paragraph_style)
        else:
            concepto_paragraph = Paragraph("&nbsp;", self.paragraph_style)
        
        # Calcular altura apropiada para el concepto del estudiante
        concepto_height = 2.2*inch  # Altura similar al PDF de referencia
        
        data = [[concepto_paragraph]]
        
        table = Table(data, colWidths=[self.content_width], rowHeights=[concepto_height])
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(table)
        
        # Área de firma del estudiante
        firma_data = [["", "Firma Estudiante:"]]
        # Estandarizar proporciones para firma del estudiante
        firma_est_col1 = self.content_width * 0.769  # ~5/6.5
        firma_est_col2 = self.content_width * 0.231  # ~1.5/6.5
        
        firma_table = Table(firma_data, colWidths=[firma_est_col1, firma_est_col2])
        firma_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(firma_table)
        
        elements.append(Spacer(1, 12))
        return elements

    def _build_concepto_asesor(self, control: ControlOperativo):
        """V. CONCEPTO DEL ASESOR JURÍDICO"""
        elements = []
        
        # Título de sección
        section_data = [["V.  CONCEPTO DEL ASESOR JURÍDICO"]]
        section_table = Table(section_data, colWidths=[self.content_width])
        section_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(section_table)
        
        # Área de texto para concepto del asesor - usar Paragraph
        concepto_asesor_text = control.concepto_asesor or ""
        if concepto_asesor_text.strip():
            concepto_asesor_paragraph = Paragraph(concepto_asesor_text, self.paragraph_style)
        else:
            concepto_asesor_paragraph = Paragraph("&nbsp;", self.paragraph_style)
        
        # Altura apropiada para concepto del asesor
        asesor_height = 2.5*inch
        
        data = [[concepto_asesor_paragraph]]
        
        table = Table(data, colWidths=[self.content_width], rowHeights=[asesor_height])
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(table)
        
        # Área de firma del asesor
        firma_data = [["", "Firma Asesor:"]]
        # Estandarizar proporciones para firma del asesor
        firma_asesor_col1 = self.content_width * 0.769  # ~5/6.5
        firma_asesor_col2 = self.content_width * 0.231  # ~1.5/6.5
        
        firma_table = Table(firma_data, colWidths=[firma_asesor_col1, firma_asesor_col2])
        firma_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(firma_table)
        
        # Agregar salto de página para la declaración
        elements.append(PageBreak())
        
        return elements

    def _build_declaracion_usuario(self):
        """VI. DECLARACIÓN DEL USUARIO - Página 2 del PDF de referencia"""
        elements = []
        
        # Título de sección
        section_data = [["VI. DECLARACIÓN DEL USUARIO"]]
        section_table = Table(section_data, colWidths=[self.content_width])
        section_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(section_table)
        
        # Texto optimizado para aprovechar al máximo el margen
        declaracion_text = """<b>1.</b> Que la información antes suministrada se puede verificar y si se comprueba que falté a la verdad y omití información, acepto el archivo y renuncia del caso por parte del CONSULTORIO JURÍDICO de la UNIVERSIDAD COLEGIO MAYOR DE CUNDINAMARCA.<br/><br/>

<b>2.</b> Que fui informado, que el compromiso profesional se inicia con previa aceptación del caso y la entrevista sin compromiso a la UNIVERSIDAD COLEGIO (CONSULTORIO JURÍDICO), ni a ninguno de los profesionales que allí labora a brindar asesoría del caso.<br/><br/>

<b>3.</b> Autorizo que en caso de no aportar los documentos requeridos en un término prudencial o de incumplir en por lo menos a dos citas, o comete alguna falta de personal que me atiende será ARCHIVADO.<br/><br/>

<b>4.</b> Igualmente autorizo a la UNIVERSIDAD COLEGIO MAYOR DE CUNDINAMARCA (CONSULTORIO JURÍDICO), para utilizar la información confidencial suministrada y requerida, con académicos e investigativos.<br/><br/>

<b>5.</b> Manifiesto que fui informado en el CONSULTORIO JURÍDICO de la UNIVERSIDAD COLEGIO MAYOR DE CUNDINAMARCA de la existencia de un equipo interdisciplinario que permite ofrecer una atención integral a los usuarios con el fin de mejorar la calidad de vida a nivel individual y/o familiar mediante un seguimiento de los casos requeridos."""
        
        # Usar el estilo especial más pequeño para que se ajuste mejor
        declaracion_paragraph = Paragraph(declaracion_text, self.declaracion_style)
        
        # Altura optimizada eliminando espacio en blanco no aprovechado
        declaracion_height = 3.8*inch  # Altura ajustada al contenido real
        # Usar content_width completo para consistencia con títulos de sección
        declaracion_width = self.content_width
        
        data = [[declaracion_paragraph]]
        
        table = Table(data, colWidths=[declaracion_width], rowHeights=[declaracion_height])
        table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),    # Márgenes internos optimizados
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),   # Para mantener texto dentro
            ('TOPPADDING', (0, 0), (-1, -1), 8),     # de la cuadrícula
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),  # según CLAUDE.md
        ]))
        elements.append(table)
        
        # Espacio para firma del usuario
        elements.append(Spacer(1, 24))
        
        firma_data = [["", "Firma del Usuario"]]
        # Estandarizar proporciones para firma del usuario final
        firma_usuario_col1 = self.content_width * 0.615  # ~4/6.5
        firma_usuario_col2 = self.content_width * 0.385  # ~2.5/6.5
        
        firma_table = Table(firma_data, colWidths=[firma_usuario_col1, firma_usuario_col2])
        firma_table.setStyle(TableStyle([
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LINEABOVE', (1, 0), (1, 0), 1, black),
            ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ]))
        elements.append(firma_table)
        
        # Pie de página
        elements.append(Spacer(1, 24))
        elements.append(Paragraph(
            "<i>Calle 5C No. 94I – 25 Edificio Nuevo Piso 4 – UPK - Bogotá, D.C. &nbsp;&nbsp;&nbsp; Correo: consultoriojuridico.kennedy@unicolmayor.edu.co</i>", 
            self.field_style
        ))
        
        return elements

# Instancia global del generador
pdf_generator = ControlOperativoPDFGenerator()