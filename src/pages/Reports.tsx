import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Download, FileSpreadsheet } from "lucide-react";
import { reportService } from "@/services/reportService";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExportPDF = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona las fechas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const blob = await reportService.exportPDF(startDate, endDate);
      reportService.downloadFile(blob, `reporte_${startDate}_${endDate}.pdf`);
      toast({
        title: "Éxito",
        description: "Reporte PDF descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el reporte PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona las fechas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const blob = await reportService.exportExcel(startDate, endDate);
      reportService.downloadFile(blob, `reporte_${startDate}_${endDate}.xlsx`);
      toast({
        title: "Éxito",
        description: "Reporte Excel descargado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el reporte Excel",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Reportes</h1>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Generar Reporte
              </h2>
              <p className="text-muted-foreground">
                Selecciona el rango de fechas para generar el reporte de sensores y actuadores
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="start-date">Fecha Inicio</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">Fecha Fin</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleExportPDF}
                disabled={loading}
                size="lg"
                className="w-full h-24 flex flex-col gap-2"
              >
                <FileText className="w-8 h-8" />
                <span>Exportar a PDF</span>
              </Button>

              <Button
                onClick={handleExportExcel}
                disabled={loading}
                variant="outline"
                size="lg"
                className="w-full h-24 flex flex-col gap-2"
              >
                <FileSpreadsheet className="w-8 h-8" />
                <span>Exportar a Excel</span>
              </Button>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Download className="w-5 h-5 animate-bounce" />
                <p>Generando reporte...</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Información del Reporte
          </h3>
          <div className="space-y-2 text-muted-foreground">
            <p>• El reporte incluye todas las lecturas del sensor HC-SR05</p>
            <p>• Historial de estados de los 3 LEDs</p>
            <p>• Registro de pulsaciones de botones</p>
            <p>• Mensajes mostrados en el LCD</p>
            <p>• Estadísticas y gráficos del periodo seleccionado</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
