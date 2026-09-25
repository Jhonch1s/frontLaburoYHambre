import { useEffect, useRef } from 'react';
import * as roughViz from 'rough-viz';
import "./CrecimientoChart.css"

interface CrecimientoChartProps {
  chartData: {
    labels: string[];
    values: number[];
  };
}

export const CrecimientoChart = ({ chartData }: CrecimientoChartProps) => {
  // id único por instancia
  const containerId = 'crecimiento-chart';

  

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || chartData.labels.length === 0) return;

    container.innerHTML = '';

    new roughViz.Line({
      element: `#${containerId}`,   
      data: chartData,
      title: 'Crecimiento de tu Patrimonio',
      xLabel: 'Año',
      yLabel: 'Dinero Acumulado (USD)',
      roughness: 0.5,
      stroke: '#111',
      strokeWidth: 2,
      fillStyle: 'hachure',
      fillWeight: 1,
      width: container.clientWidth,
      height: 400,
    });

    return () => {
      container.innerHTML = '';
    };
  }, [chartData]);

  return <div id={containerId} className="chart-container" />;
};