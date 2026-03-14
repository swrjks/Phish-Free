import { motion } from "framer-motion";
import { useLayoutEffect, useRef } from "react";

import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";

const GlobalThreatMap = () => {
  const chartDivRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const chartDiv = chartDivRef.current;
    if (!chartDiv) return;

    const root = am5.Root.new(chartDiv);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX",
        panY: "translateY",
        wheelX: "none",
        wheelY: "zoom",
        pinchZoom: true,
        projection: am5map.geoMercator(),
        animationDuration: 700,
        animationEasing: am5.ease.out(am5.ease.cubic),
      })
    );

    // Transparent interactive "ocean" background: click to reset to world view.
    chart.chartContainer.set(
      "background",
      am5.Rectangle.new(root, {
        fillOpacity: 0,
        interactive: true,
      })
    );

    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        exclude: ["AQ"], // Exclude Antarctica
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      cursorOverStyle: "pointer",
      strokeOpacity: 1,
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fillOpacity: 0.85,
      strokeWidth: 1.5,
    });

    polygonSeries.mapPolygons.template.states.create("active", {
      fillOpacity: 1,
      strokeWidth: 2,
    });

    let activePolygon: am5map.MapPolygon | undefined;

    const clearActive = () => {
      if (activePolygon) {
        activePolygon.states.applyAnimate("default");
        activePolygon = undefined;
      }
    };

    polygonSeries.mapPolygons.template.events.on("click", (ev) => {
      const polygon = ev.target;
      const dataItem = polygon.dataItem;
      if (!dataItem) return;

      if (activePolygon && activePolygon !== polygon) {
        activePolygon.states.applyAnimate("default");
      }
      activePolygon = polygon;
      polygon.states.applyAnimate("active");

      // Smooth zoom into the clicked country.
      (chart as any).zoomToDataItem(dataItem);
    });

    chart.chartContainer.get("background")?.events.on("click", () => {
      clearActive();
      chart.goHome();
    });

    const zoomControl = am5map.ZoomControl.new(root, {});
    chart.set("zoomControl", zoomControl);

    // Position bottom-right, and show only +/- (hide home).
    zoomControl.setAll({
      x: am5.p100,
      centerX: am5.p100,
      y: am5.p100,
      centerY: am5.p100,
      dx: -12,
      dy: -12,
    });
    zoomControl.homeButton.setAll({ forceHidden: true });

    // Animate on load.
    polygonSeries.appear(900);
    chart.appear(900, 50);

    return () => {
      root.dispose();
    };
  }, []);

  return (
    <section id="global-map" className="py-32">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-4">
            Global threat map
          </h2>
          <p className="text-muted-foreground">Phishing attacks detected worldwide in real-time.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="rounded-lg border border-border bg-card relative overflow-hidden max-w-7xl mx-auto"
        >
          <div className="p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <p className="text-xs text-muted-foreground">
                Drag to pan. Use mouse wheel or the +/− buttons to zoom. Click ocean to reset.
              </p>
            </div>

            <div className="h-64 md:h-[350px] rounded-md border border-border bg-background/30 overflow-hidden">
              <div ref={chartDivRef} className="w-full h-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default GlobalThreatMap;
