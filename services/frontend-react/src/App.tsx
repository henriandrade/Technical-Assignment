import ProductCanvas from "@/scenes/ProductCanvas";
import WardrobeConfigurator from "@/scenes/Configurators/Wardrobe";
import { PanelConfigurator } from "@/layout/PanelConfigurator";
import { useRef } from "react";
import type { StoreApi } from "zustand";
import type { WardrobeStore } from "@/scenes/Configurators/Wardrobe/Wardrobe.store";
import { createWardrobeStore } from "@/scenes/Configurators/Wardrobe/Wardrobe.store";

export default function App() {
  const storeRef = useRef<StoreApi<WardrobeStore> | null>(null);
  if (!storeRef.current) storeRef.current = createWardrobeStore();
  const store = storeRef.current;

  const clearSelection = () => {
    const { setHovered, setSelected } = store.getState();
    setHovered({ type: null, id: null });
    setSelected({ type: null, id: null });
  };

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      <ProductCanvas onPointerMissed={clearSelection}>
        <WardrobeConfigurator store={store} />
      </ProductCanvas>
      <PanelConfigurator store={store} />
    </div>
  );
}
