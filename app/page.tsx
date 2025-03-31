"use client";
import dynamic from "next/dynamic";
import { useMemo, useRef, useState, useEffect } from "react";
import { LatLngTuple } from "leaflet";

export default function Home() {
  const position: LatLngTuple = [20.0, -89.0];
  const zoom = 5;
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/map"), {
        loading: () => <p>A map is loading...</p>,
        ssr: false,
      }),
    []
  );
  return (
    <div className="p-5">
      <div>
        <Map position={position} zoom={zoom} height="94vh" />
      </div>
    </div>
  );
}
