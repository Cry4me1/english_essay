/**
 * 导出工具函数
 * 支持 PDF、Word (DOCX) 导出和打印功能
 * 
 * 性能优化：使用动态导入，只在用户实际导出时才加载库
 */

// 类型导入（不会被打包进 bundle）
import type { jsPDF as JsPDFType } from 'jspdf';

// 批改数据类型
interface CorrectionBreakdown {
    label: string;
    value: number;
}

interface Annotation {
    id: string;
    type: 'grammar' | 'vocabulary' | 'logic';
    originalText: string;
    suggestion: string;
    reason: string;
}

interface CorrectionData {
    score: number;
    summary: string;
    breakdown: CorrectionBreakdown[];
    annotations: Annotation[];
}

export interface ExportOptions {
    title: string;
    content: string;
    correctionData?: CorrectionData | null;
    includeScore?: boolean;
    includeAnnotations?: boolean;
}

/**
 * 动态加载 html2canvas
 */
async function loadHtml2Canvas() {
    const { default: html2canvas } = await import('html2canvas');
    return html2canvas;
}

/**
 * 动态加载 jsPDF
 */
async function loadJsPDF(): Promise<typeof JsPDFType> {
    const { jsPDF } = await import('jspdf');
    return jsPDF;
}

/**
 * 动态加载 docx 相关模块
 */
async function loadDocx() {
    const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        HeadingLevel,
        AlignmentType,
        BorderStyle,
        Table,
        TableRow,
        TableCell,
        WidthType,
    } = await import('docx');
    return {
        Document,
        Packer,
        Paragraph,
        TextRun,
        HeadingLevel,
        AlignmentType,
        BorderStyle,
        Table,
        TableRow,
        TableCell,
        WidthType,
    };
}

/**
 * 动态加载 file-saver
 */
async function loadFileSaver() {
    const { saveAs } = await import('file-saver');
    return saveAs;
}

/**
 * 生成导出用的 HTML 内容
 */
function generateExportHTML(options: ExportOptions): string {
    const { title, content, correctionData, includeScore = true, includeAnnotations = true } = options;
    const date = new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    let html = `
    <div style="font-family: Georgia, 'Noto Serif SC', serif; padding: 40px; max-width: 800px; margin: 0 auto; background: white; color: #1a1a2e;">
      <div style="text-align: center; margin-bottom: 32px; border-bottom: 2px solid #e5e5e5; padding-bottom: 24px;">
        <h1 style="font-size: 28px; margin: 0 0 8px 0; color: #1a1a2e;">${title || '无标题'}</h1>
        <p style="font-size: 14px; color: #6b6b7b; margin: 0;">生成日期: ${date} · 字数: ${wordCount}</p>
      </div>
      
      <div style="line-height: 1.8; font-size: 16px; white-space: pre-wrap; margin-bottom: 32px;">
        ${content.replace(/\n/g, '<br>')}
      </div>
  `;

    // 添加 AI 评分信息
    if (includeScore && correctionData) {
        html += `
      <div style="border-top: 2px solid #e5e5e5; padding-top: 24px; margin-top: 24px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <span style="font-size: 24px;">📊</span>
          <h2 style="font-size: 20px; margin: 0; color: #5b5fc7;">AI 评分: Band ${correctionData.score.toFixed(1)}</h2>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
          <tr>
            ${correctionData.breakdown.map(item => `
              <td style="padding: 12px; text-align: center; background: #f5f5f5; border-radius: 8px;">
                <div style="font-size: 12px; color: #6b6b7b;">${item.label}</div>
                <div style="font-size: 18px; font-weight: bold; color: #5b5fc7;">Band ${item.value.toFixed(1)}</div>
              </td>
            `).join('')}
          </tr>
        </table>
        
        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="font-size: 14px; margin: 0 0 8px 0; color: #6b6b7b;">📝 AI 总评</h3>
          <p style="margin: 0; line-height: 1.6;">${correctionData.summary}</p>
        </div>
      </div>
    `;

        // 添加修改建议
        if (includeAnnotations && correctionData.annotations.length > 0) {
            const typeLabels: Record<string, string> = {
                grammar: '🔴 语法',
                vocabulary: '🟡 词汇',
                logic: '🔵 逻辑',
            };

            html += `
        <div style="margin-top: 24px;">
          <h3 style="font-size: 16px; margin: 0 0 12px 0;">🔧 修改建议 (${correctionData.annotations.length})</h3>
          ${correctionData.annotations.map((ann, idx) => `
            <div style="background: #fff; border: 1px solid #e5e5e5; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; color: #6b6b7b;">${idx + 1}. ${typeLabels[ann.type] || ann.type}</span>
              </div>
              <div style="font-size: 14px;">
                <span style="text-decoration: line-through; color: #ef4444;">${ann.originalText}</span>
                <span style="margin: 0 8px;">→</span>
                <span style="color: #22c55e;">${ann.suggestion}</span>
              </div>
              <p style="font-size: 12px; color: #6b6b7b; margin: 8px 0 0 0;">${ann.reason}</p>
            </div>
          `).join('')}
        </div>
      `;
        }
    }

    html += `</div>`;
    return html;
}

/**
 * 导出为 PDF (动态加载库)
 */
export async function exportToPDF(options: ExportOptions): Promise<void> {
    // 动态加载依赖
    const [html2canvas, JsPDF] = await Promise.all([
        loadHtml2Canvas(),
        loadJsPDF(),
    ]);

    // 创建临时容器
    const container = document.createElement('div');
    container.innerHTML = generateExportHTML(options);
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.background = 'white';
    document.body.appendChild(container);

    try {
        // 使用 html2canvas 截图
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
        });

        // 创建 PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = new JsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;

        // 计算需要多少页
        const scaledHeight = imgHeight * ratio;
        const pageCount = Math.ceil(scaledHeight / pdfHeight);

        for (let i = 0; i < pageCount; i++) {
            if (i > 0) {
                pdf.addPage();
            }
            pdf.addImage(
                imgData,
                'PNG',
                imgX,
                -i * pdfHeight,
                imgWidth * ratio,
                imgHeight * ratio
            );
        }

        // 下载
        const filename = `${options.title || '文章'}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);
    } finally {
        document.body.removeChild(container);
    }
}

/**
 * 导出为 Word (DOCX) - 动态加载库
 */
export async function exportToWord(options: ExportOptions): Promise<void> {
    // 动态加载依赖
    const [docx, saveAs] = await Promise.all([
        loadDocx(),
        loadFileSaver(),
    ]);

    const {
        Document,
        Packer,
        Paragraph,
        TextRun,
        HeadingLevel,
        AlignmentType,
        BorderStyle,
        Table,
        TableRow,
        TableCell,
        WidthType,
    } = docx;

    const { title, content, correctionData, includeScore = true, includeAnnotations = true } = options;
    const date = new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

    // 使用 unknown[] 避免类型问题
    const children: unknown[] = [];

    // 标题
    children.push(
        new Paragraph({
            text: title || '无标题',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `生成日期: ${date} · 字数: ${wordCount}`,
                    size: 22,
                    color: '666666',
                }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
        })
    );

    // 分隔线
    children.push(
        new Paragraph({
            border: {
                bottom: {
                    color: 'CCCCCC',
                    style: BorderStyle.SINGLE,
                    size: 1,
                },
            },
            spacing: { after: 400 },
        })
    );

    // 正文内容
    const paragraphs = content.split('\n').filter(p => p.trim());
    paragraphs.forEach(para => {
        children.push(
            new Paragraph({
                children: [
                    new TextRun({
                        text: para,
                        size: 24,
                    }),
                ],
                spacing: { after: 200, line: 360 },
            })
        );
    });

    // AI 评分
    if (includeScore && correctionData) {
        children.push(
            new Paragraph({
                border: {
                    top: {
                        color: 'CCCCCC',
                        style: BorderStyle.SINGLE,
                        size: 1,
                    },
                },
                spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: `📊 AI 评分: Band ${correctionData.score.toFixed(1)}`,
                        bold: true,
                        size: 28,
                        color: '5B5FC7',
                    }),
                ],
                spacing: { after: 200 },
            })
        );

        // 评分明细表格
        const breakdownRow = new TableRow({
            children: correctionData.breakdown.map(item =>
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({ text: item.label, size: 20, color: '666666' }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                        new Paragraph({
                            children: [
                                new TextRun({ text: `Band ${item.value.toFixed(1)}`, bold: true, size: 24, color: '5B5FC7' }),
                            ],
                            alignment: AlignmentType.CENTER,
                        }),
                    ],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                })
            ),
        });

        children.push(
            new Table({
                rows: [breakdownRow],
                width: { size: 100, type: WidthType.PERCENTAGE },
            }),
            new Paragraph({ spacing: { after: 200 } })
        );

        // AI 总评
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: '📝 AI 总评', bold: true, size: 24 }),
                ],
                spacing: { before: 200, after: 100 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: correctionData.summary, size: 22 }),
                ],
                spacing: { after: 200 },
            })
        );

        // 修改建议
        if (includeAnnotations && correctionData.annotations.length > 0) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `🔧 修改建议 (${correctionData.annotations.length})`, bold: true, size: 24 }),
                    ],
                    spacing: { before: 200, after: 100 },
                })
            );

            const typeLabels: Record<string, string> = {
                grammar: '语法',
                vocabulary: '词汇',
                logic: '逻辑',
            };

            correctionData.annotations.forEach((ann, idx) => {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: `${idx + 1}. [${typeLabels[ann.type] || ann.type}] `, bold: true, size: 22 }),
                            new TextRun({ text: ann.originalText, strike: true, color: 'EF4444', size: 22 }),
                            new TextRun({ text: ' → ', size: 22 }),
                            new TextRun({ text: ann.suggestion, color: '22C55E', size: 22 }),
                        ],
                        spacing: { after: 50 },
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({ text: ann.reason, size: 20, color: '666666', italics: true }),
                        ],
                        spacing: { after: 150 },
                        indent: { left: 400 },
                    })
                );
            });
        }
    }

    // 创建文档
    const doc = new Document({
        sections: [{
            properties: {},
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            children: children as any[],
        }],
    });

    // 生成并下载
    const blob = await Packer.toBlob(doc);
    const filename = `${options.title || '文章'}_${new Date().toISOString().split('T')[0]}.docx`;
    saveAs(blob, filename);
}

/**
 * 打印预览 (无需动态导入，使用浏览器原生功能)
 */
export function printPreview(options: ExportOptions): void {
    const html = generateExportHTML(options);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('无法打开打印窗口，请检查浏览器弹窗设置');
        return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${options.title || '文章'} - 打印预览</title>
        <style>
          @media print {
            body { margin: 0; padding: 20mm; }
            @page { margin: 15mm; size: A4; }
          }
          body { margin: 0; padding: 20px; }
        </style>
      </head>
      <body>
        ${html}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
    printWindow.document.close();
}
