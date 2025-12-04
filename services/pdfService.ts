
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order, Customer, StoreSettings } from '../types';

// Helper to fetch image as base64 for jsPDF
const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | null> => {
    if (!imageUrl) return null;
    try {
        // Add cache busting and CORS settings to avoid NetworkError
        const res = await fetch(imageUrl, { 
            method: 'GET',
            cache: 'no-store',
            credentials: 'omit' 
        });
        
        if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
        
        const blob = await res.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn("Image fetch failed for PDF (skipping image):", e);
        return null;
    }
};

export const generateInvoicePdf = async (
    order: Order,
    customer: Customer,
    settings: StoreSettings
) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // BRAND COLORS
    // Brand Header: #5C374C (RGB: 92, 55, 76)
    
    const colorPrimary = [92, 55, 76];

    // --- 1. HEADER DESIGN ---
    let cursorY = 20;
    const logoWidth = 25;
    const logoHeight = 25;
    let textStartX = margin;

    // Draw Logo
    if (settings.logoUrl) {
        const base64Logo = await getBase64ImageFromUrl(settings.logoUrl);
        if (base64Logo) {
            try {
                doc.addImage(base64Logo, 'PNG', margin, 10, logoWidth, logoHeight);
                textStartX = margin + logoWidth + 5; // Shift text to the right of logo
            } catch (err) {
                console.warn("Could not add logo to PDF:", err);
            }
        }
    }

    // Large Brand Name (Next to Logo)
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(92, 55, 76); // Brand Color
    // Vertically center with logo approx
    doc.text(settings.logoText, textStartX, 22);

    // Address Block (Below)
    const addrBlockY = 35;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black text
    
    // 1. Business Name (Bold, Normal Font)
    doc.setFont('helvetica', 'bold');
    doc.text(settings.logoText, margin, addrBlockY);
    
    // 2. Address & Contact Info
    doc.setFont('helvetica', 'normal');
    let currentAddrY = addrBlockY + 5;
    
    // Split address into lines
    const addressLines = doc.splitTextToSize(settings.address, 80);
    doc.text(addressLines, margin, currentAddrY);
    currentAddrY += (addressLines.length * 4);

    // Ensure "New Zealand" is present
    const addrStr = settings.address.toLowerCase();
    if (!addrStr.includes('new zealand') && !addrStr.includes('nz')) {
        doc.text("New Zealand", margin, currentAddrY);
        currentAddrY += 4;
    }

    // Phone Number
    if (settings.phone) {
        doc.text(`Phone: ${settings.phone}`, margin, currentAddrY);
        currentAddrY += 4;
    }
    
    // Tax Number (if applicable)
    const hasSnapshot = !!order.tax;
    const taxEnabled = hasSnapshot ? true : (settings.tax && settings.tax.enabled);
    const taxLabel = hasSnapshot ? order.tax!.label : settings.tax.label;
    const taxNumber = settings.tax.taxNumber;
    
    if (taxEnabled && taxNumber) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${taxLabel} #: ${taxNumber}`, margin, currentAddrY + 2);
        currentAddrY += 6;
    }

    // Invoice Meta Data (Top Right)
    // "INVOICE"
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(150, 150, 150); // Light grey for "INVOICE" label
    doc.text("INVOICE", pageWidth - margin, 25, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    const metaXLabel = pageWidth - margin - 40;
    const metaXValue = pageWidth - margin;
    let metaY = 35;

    doc.text("Invoice #:", metaXLabel, metaY);
    doc.setFont('helvetica', 'normal');
    doc.text(order.id, metaXValue, metaY, { align: 'right' });
    
    metaY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text("Date:", metaXLabel, metaY);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(order.orderDate).toLocaleDateString(), metaXValue, metaY, { align: 'right' });
    
    metaY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text("Status:", metaXLabel, metaY);
    doc.setFont('helvetica', 'normal');
    doc.text(order.status, metaXValue, metaY, { align: 'right' });

    // Separator Line
    const separatorY = Math.max(currentAddrY, metaY) + 5;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, separatorY, pageWidth - margin, separatorY);

    cursorY = separatorY + 10;


    // --- 2. BILL TO / SHIP TO BOXES ---
    
    const boxWidth = (pageWidth - (margin * 3)) / 2;
    const boxHeight = 35;
    
    // Bill To Box (Light Background)
    doc.setFillColor(253, 245, 248); // Light pink
    doc.setDrawColor(235, 199, 199); // Brand pink border
    doc.roundedRect(margin, cursorY, boxWidth, boxHeight, 2, 2, 'FD');
    
    doc.setFontSize(10);
    doc.setTextColor(92, 55, 76);
    doc.setFont('helvetica', 'bold');
    doc.text("Bill To:", margin + 5, cursorY + 7);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.name, margin + 5, cursorY + 14);
    doc.text(customer.email, margin + 5, cursorY + 19);
    const billAddressStr = `${order.billingAddress?.street || ''}, ${order.billingAddress?.city || ''}`;
    doc.text(billAddressStr, margin + 5, cursorY + 24);

    // Ship To Box
    const shipX = margin + boxWidth + margin;
    doc.setFillColor(253, 245, 248);
    doc.roundedRect(shipX, cursorY, boxWidth, boxHeight, 2, 2, 'FD');
    
    doc.setTextColor(92, 55, 76);
    doc.setFont('helvetica', 'bold');
    doc.text("Ship To:", shipX + 5, cursorY + 7);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    const shipAddressStr = order.shippingAddress 
        ? `${order.shippingAddress.street}, ${order.shippingAddress.city}\n${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
        : 'Same as billing';
    const shipLines = doc.splitTextToSize(shipAddressStr, boxWidth - 10);
    doc.text(shipLines, shipX + 5, cursorY + 14);

    cursorY += boxHeight + 15;

    // --- 3. ITEM TABLE ---
    
    const tableColumn = ["Item Description", "Qty", "Price", "Total"];
    const tableRows: (string | number)[][] = [];
    
    order.items.forEach((item) => {
        let nameWithOpts = item.productName;
        if(item.customizations) {
            const opts = Object.entries(item.customizations)
                .map(([k, v]) => v)
                .filter(v => v)
                .join(', ');
            if(opts) nameWithOpts += `\n• ${opts}`;
        }

        const itemData = [
            nameWithOpts,
            item.quantity,
            `$${item.price.toFixed(2)}`,
            `$${(item.price * item.quantity).toFixed(2)}`
        ];
        tableRows.push(itemData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: cursorY,
        theme: 'grid',
        headStyles: { 
            fillColor: [92, 55, 76], // Brand Header Color
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left'
        },
        styles: {
            fontSize: 10,
            cellPadding: 4,
            lineColor: [235, 199, 199], // Light pink grid lines
            lineWidth: 0.1,
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, 
            1: { cellWidth: 20, halign: 'center' }, 
            2: { cellWidth: 30, halign: 'right' }, 
            3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' } 
        },
        margin: { left: margin, right: margin }
    });
    
    // --- 4. TOTALS ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const subtotal = order.total - order.shippingCost;
    
    // Calculate GST amount
    const taxRate = hasSnapshot ? order.tax!.rate : settings.tax.rate;
    let gstAmount = 0;
    if (hasSnapshot) {
        gstAmount = order.tax!.amount;
    } else if (taxEnabled) {
         const rateFraction = taxRate / (100 + taxRate);
         gstAmount = order.total * rateFraction;
    }

    const totalsW = 70;
    const totalsX = pageWidth - margin - totalsW;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    const drawSummaryLine = (label: string, value: string, y: number, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.text(label, totalsX, y);
        doc.text(value, pageWidth - margin, y, { align: 'right' });
    };

    let summaryY = finalY;
    drawSummaryLine("Subtotal:", `$${subtotal.toFixed(2)}`, summaryY);
    summaryY += 6;
    
    drawSummaryLine("Shipping:", `$${order.shippingCost.toFixed(2)}`, summaryY);
    summaryY += 6;
    
    if (taxEnabled) {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(9);
        drawSummaryLine(`Includes ${taxLabel} (${taxRate}%):`, `$${gstAmount.toFixed(2)}`, summaryY);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        summaryY += 8;
    } else {
        summaryY += 2;
    }
    
    // Colored Grand Total Box
    doc.setFillColor(92, 55, 76);
    doc.rect(totalsX - 5, summaryY - 5, totalsW + 5, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text("Total:", totalsX, summaryY + 3);
    doc.text(`$${order.total.toFixed(2)}`, pageWidth - margin - 2, summaryY + 3, { align: 'right' });

    // --- 5. FOOTER TERMS ---
    const footerBottomY = pageHeight - margin;
    
    if (settings.invoiceTerms) {
        doc.setTextColor(80, 80, 80);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text("TERMS & CONDITIONS", margin, footerBottomY - 25);
        
        doc.setFont('helvetica', 'normal');
        const termsLines = doc.splitTextToSize(settings.invoiceTerms, pageWidth - (margin * 2));
        doc.text(termsLines, margin, footerBottomY - 20);
    }
    
    // Payment Instructions (if Bank Transfer)
    if (order.paymentMethod === 'Bank Transfer' && settings.payment.bankTransfer.enabled) {
        const payY = footerBottomY - 45;
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, payY, pageWidth - (margin * 2), 15, 'F');
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text("PAYMENT INSTRUCTIONS:", margin + 2, payY + 6);
        doc.setFont('helvetica', 'normal');
        const cleanInst = settings.payment.bankTransfer.instructions.replace(/\n/g, ' | ');
        doc.text(cleanInst, margin + 2, payY + 11);
    }

    // Page Number
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text("Page 1 of 1", pageWidth / 2, pageHeight - 5, { align: 'center' });

    doc.save(`invoice-${order.id}.pdf`);
};
