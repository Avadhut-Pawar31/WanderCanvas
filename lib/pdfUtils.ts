import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { TravelBoard } from '@/types';

export async function generatePDF(board: TravelBoard): Promise<boolean> {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (text: string, fontSize: number, isBold: boolean = false) => {
      pdf.setFontSize(fontSize);
      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      } else {
        pdf.setFont('helvetica', 'normal');
      }
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      
      // Check if we need a new page
      if (yPosition + (lines.length * fontSize * 0.35) > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      
      pdf.text(lines, margin, yPosition);
      yPosition += lines.length * fontSize * 0.35 + 5;
    };

    // Helper function to add image
    const addImage = async (imageUrl: string, width: number, height: number) => {
      try {
        // Check if we need a new page
        if (yPosition + height > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        const img = await loadImage(imageUrl);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = canvas.toDataURL('image/jpeg', 0.7);
          pdf.addImage(imgData, 'JPEG', margin, yPosition, width, height);
          yPosition += height + 10;
        }
      } catch (error) {
        console.error('Failed to load image:', error);
        // Skip image if it fails to load
      }
    };

    // Title
    pdf.setFillColor(99, 102, 241); // Indigo color
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text(board.destination.name, pageWidth / 2, 25, { align: 'center' });
    
    yPosition = 50;
    pdf.setTextColor(0, 0, 0);

    // Destination Overview
    addText('Travel Guide', 20, true);
    addText(board.destination.description, 11);
    
    addText('Best Season to Visit', 14, true);
    addText(board.destination.bestSeason, 11);
    
    addText('Weather', 14, true);
    addText(board.destination.weather, 11);
    
    addText('Daily Budget', 14, true);
    addText(`$${board.destination.dailyBudget.toFixed(2)} USD`, 11);

    // Add some spacing
    yPosition += 5;

    // Color Palette
    pdf.addPage();
    yPosition = margin;
    addText('Color Palette', 18, true);
    
    board.colorPalette.forEach((color, index) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.setFillColor(
        parseInt(color.hex.slice(1, 3), 16),
        parseInt(color.hex.slice(3, 5), 16),
        parseInt(color.hex.slice(5, 7), 16)
      );
      pdf.rect(margin, yPosition, 20, 10, 'F');
      pdf.setFontSize(11);
      pdf.text(`${color.name} - ${color.hex}`, margin + 25, yPosition + 7);
      yPosition += 15;
    });

    // Attractions
    pdf.addPage();
    yPosition = margin;
    addText('Places to Visit', 18, true);
    
    board.attractions.forEach((attraction) => {
      addText(attraction.name, 13, true);
      addText(attraction.description, 10);
      addText(`Duration: ${attraction.duration} | Category: ${attraction.category}`, 9);
      yPosition += 3;
    });

    // Food Recommendations
    pdf.addPage();
    yPosition = margin;
    addText('Local Food Recommendations', 18, true);
    
    board.foodRecommendations.forEach((food) => {
      addText(food.name, 13, true);
      addText(food.description, 10);
      addText(`Cultural Significance: ${food.significance}`, 9);
      yPosition += 3;
    });

    // Packing List
    pdf.addPage();
    yPosition = margin;
    addText('Smart Packing List', 18, true);
    
    const categories = [...new Set(board.packingList.map(item => item.category))];
    categories.forEach((category) => {
      addText(category, 12, true);
      const items = board.packingList.filter(item => item.category === category);
      items.forEach((item) => {
        pdf.setFontSize(10);
        pdf.text(`• ${item.item}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 2;
    });

    // Itinerary
    pdf.addPage();
    yPosition = margin;
    addText('Personalized Itinerary', 18, true);
    
    board.itinerary.forEach((day) => {
      addText(`Day ${day.day}`, 14, true);
      addText(`Morning: ${day.morning}`, 10);
      addText(`Afternoon: ${day.afternoon}`, 10);
      addText(`Evening: ${day.evening}`, 10);
      yPosition += 3;
    });

    // Travel Insights
    pdf.addPage();
    yPosition = margin;
    addText('Travel Insights', 18, true);
    
    board.insights.forEach((insight) => {
      addText(insight.title, 13, true);
      insight.content.forEach((item) => {
        pdf.setFontSize(10);
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(`• ${item}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 5;
    });

    // Footer on last page
    pdf.setFontSize(9);
    pdf.setTextColor(128, 128, 128);
    pdf.text(
      `Generated by WanderCanvas on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Save the PDF
    const fileName = `${board.destination.name.replace(/\s+/g, '-')}-Travel-Guide.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// Helper function to load images
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function exportTravelBoardPDF(board: TravelBoard): Promise<void> {
  const loadingToast = toast.loading('Generating PDF...');
  
  try {
    await generatePDF(board);
    toast.success('PDF downloaded successfully!', { id: loadingToast });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    toast.error('Failed to generate PDF. Please try again.', { id: loadingToast });
  }
}
