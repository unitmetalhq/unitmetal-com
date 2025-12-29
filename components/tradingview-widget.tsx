"use client";
// TradingViewWidget.jsx
import { useEffect, useRef, memo } from "react";

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);
  const widgetContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent duplicate script injection
    const widgetElement = widgetContainer.current;
    if (!widgetElement || widgetElement.querySelector("script")) {
      return;
    }

    const script = document.createElement("script") as HTMLScriptElement;
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
        {
          "allow_symbol_change": true,
          "calendar": false,
          "details": false,
          "hide_side_toolbar": true,
          "hide_top_toolbar": true,
          "hide_legend": false,
          "hide_volume": false,
          "hotlist": false,
          "interval": "D",
          "locale": "en",
          "save_image": true,
          "style": "1",
          "symbol": "CRYPTO:ETHUSD",
          "theme": "dark",
          "timezone": "Etc/UTC",
          "backgroundColor": "#0F0F0F",
          "gridColor": "rgba(242, 242, 242, 0.06)",
          "watchlist": [],
          "withdateranges": false,
          "compareSymbols": [],
          "studies": [],
          "autosize": true
        }`;

    widgetElement.appendChild(script);

    // Cleanup function to remove script on unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="flex flex-col border-2 border-primary pb-8 h-[400px]">
      <div className="flex flex-row justify-between items-center bg-primary text-secondary p-1">
        <h1 className="text-lg md:text-xl font-bold">Chart</h1>
      </div>
      <div
        className="tradingview-widget-container"
        ref={container}
        style={{ height: "100%", width: "100%" }}
      >
        <div
          ref={widgetContainer}
          className="tradingview-widget-container__widget"
          style={{ height: "calc(100% - 32px)", width: "100%" }}
        ></div>
        <div className="tradingview-widget-copyright">
          <a
            href="https://www.tradingview.com/symbols/ETHUSD/?exchange=CRYPTO"
            rel="noopener nofollow"
            target="_blank"
          >
            <span className="text-blue-500 font-mono">Ethereum price</span>
          </a>
          <span className="font-mono"> by TradingView</span>
        </div>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
