"use client";

import { useEffect, useRef, useState, useCallback } from "react";




const DEFAULT_CENTER = [-69.9312, 18.65];
const DEFAULT_ZOOM   = 7.5;

const MAP_STYLES = [
  { id: "light",     label: "Mapa",     icon: "🗺️", url: "mapbox://styles/mapbox/light-v11" },
  { id: "streets",   label: "Calles",   icon: "🛣️", url: "mapbox://styles/mapbox/streets-v12" },
  { id: "satellite", label: "Satélite", icon: "🛰️", url: "mapbox://styles/mapbox/satellite-v9" },
  { id: "hybrid",    label: "Híbrido",  icon: "🌍", url: "mapbox://styles/mapbox/satellite-streets-v12" },
  { id: "dark",      label: "Oscuro",   icon: "🌑", url: "mapbox://styles/mapbox/dark-v11" },
];

// ─── POI — solo 3 categorías ──────────────────────────────────────────────────
// Usamos la Mapbox Geocoding API con texto libre + tipo "poi"
// El truco para obtener resultados en toda RD: no usamos bbox del viewport
// sino una búsqueda centrada en RD con radio amplio
const POI_CATEGORIES = [
  { id: "hospital",  label: "Hospitales",    icon: "🏥", color: "#ef4444", query: "hospital" },
  { id: "airport",   label: "Aeropuertos",   icon: "✈️", color: "#3b82f6", query: "aeropuerto" },
  { id: "mall",      label: "Plazas / Malls", icon: "🛍️", color: "#f59e0b", query: "plaza comercial" },
];

const ZONES = [
  { id: "santo_domingo", label: "Santo Domingo",       color: "#3b82f6", center: [-69.9312, 18.4861], zoom: 12 },
  { id: "sde",           label: "Santo Domingo Este",  color: "#8b5cf6", center: [-69.8655, 18.4896], zoom: 12 },
  { id: "sdn",           label: "Santo Domingo Norte", color: "#06b6d4", center: [-69.9312, 18.5600], zoom: 12 },
  { id: "juan_dolio",    label: "Juan Dolio",           color: "#10b981", center: [-69.4301, 18.4274], zoom: 13 },
  { id: "punta_cana",    label: "Punta Cana",           color: "#f59e0b", center: [-68.3725, 18.5601], zoom: 12 },
  { id: "santiago",      label: "Santiago",             color: "#ef4444", center: [-70.697,  19.4517], zoom: 12 },
  { id: "puerto_plata",  label: "Puerto Plata",         color: "#ec4899", center: [-70.6926, 19.7933], zoom: 12 },
];

const properties = [
  {
    id: 1, zone: "juan_dolio",
    title: "Vientos Del Mar",
    price: "US$143,900", monthlyFee: "US$2,055/mes",
    deliveryDate: "Marzo 2028", beds: "2 hab", baths: 2, sqft: "61-74 m²",
    image: "https://cdn.plusval.com.do/properties/6llWX1730925655-full.jpg",
    coordinates: [-69.397034, 18.431720], status: "En preventa",
    url: "https://drive.google.com/drive/folders/1VJgVAxxDj39YYAkqMtZ9s57-8YIWh9qH?usp=drive_link",
    promo: { label: "🎉 Oferta de feria", detail: "Reserva por solo US$1000" },
  },
  {
    id: 2, zone: "santo_domingo",
    title: "Marelo Residences",
    price: "US$188,000", monthlyFee: "N/A",
    deliveryDate: "Q4 2026", beds: "1-2-3 hab", baths: 1, sqft: "64-133 m²",
    image: "https://cdn.plusval.com.do/properties/Imm3O1677877224-full.jpg",
    coordinates: [-69.939519, 18.461874], status: "Proximo a entrega",
    url: "https://drive.google.com/drive/folders/1mkTXXMeuaNE6tBjuCNE0hfXaFbW9RFVB?usp=drive_link",
    promo: null,
  },
  {
    id: 3, zone: "santo_domingo",
    title: "Urban Life",
    price: "US$182,000", monthlyFee: "N/A",
    deliveryDate: "Q3 2026", beds: "1-2 hab", baths: 2, sqft: "50-60 m²",
    image: "https://cdn.plusval.com.do/properties/iN2kH1648217816-full.jpg",
    coordinates: [-69.943602, 18.476738], status: "Listo para entrega",
    url: "https://drive.google.com/drive/folders/11BTxVUMhBHVA0QgMHOppTGxQJ5LAX8iG?usp=drive_link",
    promo: null/* { label: "⚡ Último precio", detail: "6% descuento" } */,
  },
  {
    id: 4, zone: "juan_dolio",
    title: "Skysea",
    price: "US$177,500", monthlyFee: "US$1,650/mes",
    deliveryDate: "Enero 2029", beds: "2 hab", baths: 2, sqft: "76-91 m²",
    image: "https://cdn.plusval.com.do/properties/wsgRBb-1768597291-full.webp",
    coordinates: [-69.384241, 18.427653], status: "En preventa",
    url: "https://drive.google.com/drive/folders/1NtEd7L3zscZLrdQ10pR32QDZSfRJE_Ln?usp=drive_link",
    promo: { label: "🎉 Oferta de feria", detail: "Reserva por solo US$1000" },
  },
  {
    id: 5, zone: "santo_domingo",
    title: "Urbano II",
    price: "US$182,115", monthlyFee: "N/A",
    deliveryDate: "Q3 2026", beds: "1-2 hab", baths: 2, sqft: "54-79 m²",
    image: "https://cdn.plusval.com.do/properties/llPeU0-1774300183-full.webp",
    coordinates: [-69.939194, 18.470327], status: "Listo",
    url: "https://drive.google.com/drive/folders/18KNIDSo6Njc6S4nlYYYeFtPCKGwZRHoM?usp=drive_link",
    promo: null,
  },
  {
    id: 6, zone: "sde",
    title: "Arrecifes del Sol",
    price: "US$75,500", monthlyFee: "US$700/mes",
    deliveryDate: "Q4 2027", beds: "2-3 hab", baths: 2, sqft: "58-82 m²",
    image: "https://cdn.plusval.com.do/properties/qm3mN1666611454-full.jpg",
    coordinates: [-69.760203, 18.464758], status: "En construccion",
    url: "https://drive.google.com/drive/folders/1GK3DRnc0Fyj0i8oU1bUvuY1iK3wa-abT?usp=drive_link",
    promo: { label: "⚡Feria", detail: "Descuentos de US$500" },
  },
  {
    id: 7, zone: "santiago",
    title: "Vivea Residences",
    price: "US$85,000", monthlyFee: "US$580/mes",
    deliveryDate: "Junio 2029", beds: "3 hab", baths: 2, sqft: "80 m²",
    image: "https://cdn.plusval.com.do/properties/1jgmm1778095042-full.jpg",
    coordinates: [-70.667230, 19.406095], status: "En preventa",
    url: "https://drive.google.com/drive/folders/1_5r1fBXFfF-392HC0SeyaiDeMVaaTHvQ?usp=drive_link",
    promo: { label: "🏖️ Pre-lanzamiento", detail: "Reserva con solo US$500" },
  },
  {
    id: 8, zone: "sdn",
    title: "Senderos del Arroyo - Casas",
    price: "US$112,600", monthlyFee: "US$750/mes",
    deliveryDate: "Q1 2028", beds: "3 hab", baths: 2, sqft: "82-97 m²",
    image: "https://cdn.plusval.com.do/properties/0mYi71764347791-full.jpg",
    coordinates: [-69.951301, 18.565853], status: "En preventa",
    url: "https://drive.google.com/drive/folders/1NoJ1cJNwZOSkDnfzkF7vUD1NPcIoqsb5?usp=drive_link",
    promo: { label: "🏖️ Pre-lanzamiento", detail: "Reserva con solo US$500" },
  },
  {
    id: 9, zone: "sdn",
    title: "Terrazas del Arroyo",
    price: "US$67,000", monthlyFee: "US$480/mes",
    deliveryDate: "Febrero 2028", beds: "2-3 hab", baths: 2, sqft: "69-90 m²",
    image: "https://cdn.plusval.com.do/properties/qKfPQ1604115583-full.jpg",
    coordinates: [-69.947631, 18.567595], status: "Proximo a entrega",
    url: "https://drive.google.com/drive/folders/1yAFDaGoIyMwc010mUqnm7bm6ecvbDUes?usp=drive_link",
    promo: { label: "⚡ Feria", detail: "Reserva con solo US$500" },
  },
  {
    id: 10, zone: "punta_cana",
    title: "Velero",
    price: "US$172,000", monthlyFee: "US$2,500/mes",
    deliveryDate: "Enero 2028", beds: "1-4 hab", baths: 2, sqft: "90-238 m²",
    image: "https://cdn.plusval.com.do/properties/kTngf1749563992-full.jpg",
    coordinates: [-68.381468, 18.579974 ], status: "Listos y en Construccion",
    url: "https://drive.google.com/drive/folders/1pwuWM64mVJg-BuqkrN0hGP7CAh44eGkG?usp=drive_link",
    promo: null,
    // promo: { label: "⚡ Feria", detail: "Reserva con solo US$500" },
  },
  {
    id: 11, zone: "sde",
    title: "Vistana Costa Blanca",
    price: "US$111,095", monthlyFee: "US$800/mes",
    deliveryDate: "Noviembre 2029", beds: "1-2-3 hab", baths: 1, sqft: "55-115 m²",
    image: "https://cdn.plusval.com.do/properties/F7yR91777468967-full.jpg",
    coordinates: [-69.624893, 18.451144], status: "En preventa",
    url: "https://drive.google.com/drive/folders/1wAyW-sX61qLIwFR5A3IJQatAUe-jjjMj?usp=drive_link",
    promo: { label: "⚡ Feria", detail: "Reserva con solo US$1000" },
  },
  {
    id: 12, zone: "sde",
    title: "Altos del Este",
    price: "US$73,000", monthlyFee: "US$350/mes",
    deliveryDate: "Enero 2029", beds: "2-3 hab", baths: 2, sqft: "79-89 m²",
    image: "https://cdn.plusval.com.do/properties/rT5ebu-1757017324-full.webp",
    coordinates: [-69.753617, 18.494791], status: "En preventa",
    url: "https://drive.google.com/drive/folders/1vSbrdDcVqiq8q563S7_myC9u60wKlhwF?usp=drive_link",
    promo: { label: "⚡ Feria", detail: "Reserva con solo US$1000" },
  },
  {
    id: 13, zone: "punta_cana",
    title: "East Town",
    price: "US$96,000", monthlyFee: "N/A",
    deliveryDate: "Junio 2026", beds: "1-2-3 hab", baths: 2, sqft: "80 m²",
    image: "https://cdn.plusval.com.do/properties/ZyDRa1687275524-full.jpg",
    coordinates: [-68.417646, 18.614841], status: "Listos para entrega",
    url: "https://drive.google.com/drive/folders/1CPi4JX01ACn4eLPhA6tQt9MmNuXc6i5p?usp=drive_link",
    promo: null,
  },
  {
    id: 14, zone: "punta_cana",
    title: "Epic River - Casas",
    price: "US$179,000", monthlyFee: "US$1,250/mes",
    deliveryDate: "Marzo 2028", beds: "3 hab", baths: 3, sqft: "119 m²",
    image: "https://cdn.plusval.com.do/properties/vWsPP1747855541-full.jpg",
    coordinates: [-68.421483, 18.624882], status: "En construccion",
    url: "https://drive.google.com/drive/folders/1m8qLGRMC3mItV_xeGKYKhappQtqe_-Ku?usp=drive_link",
    promo: null,
  },
  {
    id: 15, zone: "sde",
    title: "LP11",
    price: "US$76,000", monthlyFee: "N/A",
    deliveryDate: "Junio 2026", beds: "3 hab", baths: 2, sqft: "89 m²",
    image: "https://cdn.plusval.com.do/properties/QrsT91672851272-full.jpg",
    coordinates: [-69.743650, 18.480525], status: "Listos para entrega",
    url: "https://drive.google.com/drive/folders/1mMT8JQ8H1_9Nu86MH8Km0UkU2FfeTwav?usp=drive_link",
    promo: null,
  },
  {
    id: 16, zone: "sde",
    title: "LP12",
    price: "US$86,000", monthlyFee: "US$495/mes",
    deliveryDate: "Julio 2028", beds: "3 hab", baths: 2, sqft: "64 m²",
    image: "https://cdn.plusval.com.do/properties/XDock1741020806-full.jpg",
    coordinates: [-69.751148, 18.499288], status: "En construccion",
    url: "https://drive.google.com/drive/folders/1-Ae3NoIeOap8MBh3nQaipLf0ekhTxHVy?usp=drive_link",
    promo: null,
  },
  {
    id: 17, zone: "santiago",
    title: "Vista del Limonal",
    price: "US$86,000", monthlyFee: "US$420/mes",
    deliveryDate: "Diciembre 2028", beds: "3 hab", baths: 3, sqft: "119 m²",
    image: "https://cdn.plusval.com.do/properties/IJvEm1773432654-full.jpg",
    coordinates: [-70.611791, 19.440834], status: "En preventa",
    url: "https://drive.google.com/drive/folders/1NMuMHNwYJENKju8PCYSbhoFrI28O74XW?usp=drive_link",
    promo: null,
  },
  {
    id: 18, zone: "puerto_plata",
    title: "Azumar",
    price: "US$142,350", monthlyFee: "US$2800/mes",
    deliveryDate: "Enero 2028", beds: "1-2-3 hab", baths: 1, sqft: "71 m²",
    image: "https://cdn.plusval.com.do/properties/8ePwT1756822205-full.jpg",
    coordinates: [-70.659917, 19.774533], status: "En construccion",
    url: "https://drive.google.com/drive/folders/1YTKNkXLKWjzbuO33cg79WOkfNcmaOs7p?usp=drive_link",
    promo: null,
  },
  {
    id: 19, zone: "sde",
    title: "Caney Oriental",
    price: "US$66,137", monthlyFee: "US$420/mes",
    deliveryDate: "Mayo 2028", beds: "1-2-3 hab", baths: 1, sqft: "76 m²",
    image: "https://cdn.plusval.com.do/properties/alAYdj-1771003799-full.webp",
    coordinates: [-69.750095, 18.501647], status: "En preventa",
    url: "https://drive.google.com/drive/folders/19TXBN3SVbPkbgbczTvKuI6n85Du-UZ1q?usp=drive_link",
    promo: { label: "⚡ Feria", detail: "Reserva con solo US$500" },
  },
  {
    id: 20, zone: "sde",
    title: "La Marquesa Residence",
    price: "US$69,800", monthlyFee: "US$550/mes",
    deliveryDate: "Diciembre 2027", beds: "3 hab", baths: 2, sqft: "76 m²",
    image: "https://cdn.plusval.com.do/properties/mlqtD1743091881-full.jpg",
    coordinates: [-69.739932, 18.506188], status: "Proximo a entrega",
    url: "https://drive.google.com/drive/folders/1V2C-NemjEXI1EqevUDE40BTe1PhKQolo?usp=drive_link",
    promo: { label: "⚡ Feria", detail: "Reserva con solo US$500" },
  },
  {
    id: 21, zone: "sde",
    title: "Altos del Prado 6",
    price: "US$94,913", monthlyFee: "US$540/mes",
    deliveryDate: "Agosto 2028", beds: "3 hab", baths: 2, sqft: "90.5 m²",
    image: "https://cdn.plusval.com.do/properties/ySrxXJ-1773157780-full.webp",
    coordinates: [-69.788088, 18.519458], status: "En construccion",
    url: "https://drive.google.com/drive/folders/1om8LDUhzVNhgJuBWHTfHXflYLXfjpU1g?usp=drive_link",
    promo: { label: "⚡ Feria", detail: "Reserva con solo US$500" },
  },
  {
    id: 22, zone: "sde",
    title: "OPUS Santo Domingo",
    price: "US$89,500", monthlyFee: "US$700/mes",
    deliveryDate: "Enero 2028", beds: "3 hab", baths: 2, sqft: "85 m²",
    image: "https://cdn.plusval.com.do/properties/DkUo81668617290-full.jpg",
    coordinates: [-69.805600, 18.503700], status: "En construccion",
    url: "https://drive.google.com/drive/folders/1iDbogdStyP0II0o2korn3VG2W0wO9LtB?usp=drive_link",
    promo: { label: "⚡ Feria", detail: "Reserva con solo US$500" },
  },
  {
    id: 23, zone: "sdn",
    title: "Crux Del Prado",
    price: "US$125,000", monthlyFee: "N/A",
    deliveryDate: "Listo", beds: "3 hab", baths: 2, sqft: "100 m²",
    image: "https://cdn.plusval.com.do/properties/wm_156088491567029900711.jpg",
    coordinates: [-69.942822, 18.546661], status: "Listo",
    url: "https://drive.google.com/drive/folders/1pVRwqY6rccu9dzKzW9l0ktQjXEZDFDis?usp=drive_link",
    promo: null,
  },
  {
    id: 24, zone: "sdn",
    title: "Jazz III",
    price: "US$80,000", monthlyFee: "US$640/mes",
    deliveryDate: "Junio 2028", beds: "3 hab", baths: 2, sqft: "80 m²",
    image: "https://cdn.plusval.com.do/properties/TP8y6L-1764169167-full.webp",
    coordinates: [-69.920708, 18.545455], status: "En construccion",
    url: "https://drive.google.com/drive/folders/1vPxdw0JZAxjlaJiQcnskYF8y7-ed3u1y?usp=drive_link",
    promo: { label: "⚡ Feria", detail: "Reserva con solo US$500" },
  },
  {
    id: 25, zone: "sdn",
    title: "Residencial Ciudad Palmarejo",
    price: "RD$3,300,000", monthlyFee: "RD$19,000/mes",
    deliveryDate: "Diciembre 2026", beds: "2 hab", baths: 1, sqft: "50-58 m²",
    image: "https://cdn.plusval.com.do/properties/CPGzB1741363864-full.jpg",
    coordinates: [-70.008435, 18.535980], status: "Proximo a entrega",
    url: "https://drive.google.com/drive/folders/142H_i-bkT7vFpeFak4vSI039-dFhxwBd?usp=drive_link",
    promo: { label: "⚡ Importante", detail: "Aplica Bono Vivienda" },
  },
  {
    id: 26, zone: "sdn",
    title: "Brisas del Rio",
    price: "US$49,000", monthlyFee: "US$367/mes",
    deliveryDate: "Julio 2028", beds: "2-3 hab", baths: 1, sqft: "53-76 m²",
    image: "https://cdn.plusval.com.do/properties/bduix1743437147-full.jpg",
    coordinates: [-69.875099, 18.537277], status: "En construccion",
    url: "https://drive.google.com/drive/folders/1VA7rZjH4oDgB0txUgbBmuNOsNQgG3T_M?usp=drive_link",
    promo: { label: "⚡ Feria", detail: "Reserva con solo US$500" },
  },
  {
    id: 27, zone: "sdn",
    title: "Vistas del Oeste",
    price: "US$54,500", monthlyFee: "US$364/mes",
    deliveryDate: "Noviembre 2028", beds: "2-3 hab", baths: 2, sqft: "58-74 m²",
    image: "https://cdn.plusval.com.do/properties/L3kc59-1764001507-full.webp",
    coordinates: [-70.031523, 18.471253], status: "En construccion",
    url: "https://drive.google.com/drive/folders/1uLOxGqdsT2oVyhHk3STEXR3uSX1TX3_E?usp=drive_link",
    promo: { label: "⚡ Feria", detail: "Reserva con solo US$500" },
  },
  {
    id: 28, zone: "punta_cana",
    title: "Midtown Boulevard II",
    price: "US$82,370", monthlyFee: "US$1,300/mes",
    deliveryDate: "Noviembre 2027", beds: "1-2 hab", baths: 2, sqft: "33 m²",
    image: "https://cdn.plusval.com.do/properties/9Ibeq2-1763762929-full.webp",
    coordinates: [-68.400756, 18.644539], status: "En construccion",
    url: "https://drive.google.com/drive/folders/1fV6UPNjaJlF6QW1NiOXGucHNYcf29Zn9?usp=drive_link",
    promo: { label: "⚡ MIDTOWN MIDTOWN", detail: "Reserva con solo US$1000" },
  },
];

const STATUS_COLORS = {
  "En preventa":     { bg: "#fef3c7", text: "#92400e" },
  "Disponible":      { bg: "#d1fae5", text: "#065f46" },
  "En construcción": { bg: "#dbeafe", text: "#1e40af" },
  "Entregado":       { bg: "#f3f4f6", text: "#374151" },
};

const getZone = (id) => ZONES.find((z) => z.id === id);

// ─── CARD POPUP ───────────────────────────────────────────────────────────────
const CARD_W = 300;
const CARD_H = 360; // base height (sin promo)

function PropertyCard({ prop, pixelPos, onClose, isMobile, containerW, containerH }) {
  if (!prop || !pixelPos) return null;
  const zone        = getZone(prop.zone);
  const zoneColor   = zone?.color || "#111827";
  const statusStyle = STATUS_COLORS[prop.status] || { bg: "#f3f4f6", text: "#374151" };
  const cardW       = isMobile ? Math.min(270, containerW - 24) : CARD_W;
  const cardH       = prop.promo ? CARD_H + 36 : CARD_H;
  const ARROW       = 12;

  // Clamp horizontal dentro del viewport (respetando sidebar en desktop)
  const leftEdge = isMobile ? 8 : 8;
  const rightEdge = (containerW || window.innerWidth) - cardW - 8;
  const left = Math.min(Math.max(pixelPos.x - cardW / 2, leftEdge), rightEdge);

  // Siempre encima del pin, nunca debajo
  const top = pixelPos.y - cardH - ARROW - 10;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 29 }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute", left, top,
          width: cardW, zIndex: 30,
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.1)",
          background: "#fff",
          animation: "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        {/* Imagen */}
        <div style={{ position: "relative", height: 138, overflow: "hidden" }}>
          <img src={prop.image} alt={prop.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)",
          }} />
          <span style={{
            position: "absolute", top: 8, left: 8,
            background: statusStyle.bg, color: statusStyle.text,
            fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 20,
          }}>{prop.status}</span>
          <button onClick={onClose} style={{
            position: "absolute", top: 6, right: 6,
            background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%",
            width: 26, height: 26, color: "#fff", cursor: "pointer", fontSize: 13,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          <div style={{ position: "absolute", bottom: 8, left: 10, right: 10 }}>
            <p style={{ fontSize: 9, color: zoneColor, fontWeight: 800, margin: 0,
              textTransform: "uppercase", letterSpacing: "0.6px" }}>{zone?.label}</p>
            <h2 style={{ fontSize: 13, fontWeight: 800, color: "#fff", margin: "2px 0 0", lineHeight: 1.2 }}>
              {prop.title}
            </h2>
          </div>
        </div>

        {/* Promo banner */}
        {prop.promo && (
          <div style={{
            background: "linear-gradient(90deg,#f97316,#ef4444)",
            padding: "6px 12px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{prop.promo.label}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#fff",
              background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "2px 9px",
            }}>{prop.promo.detail}</span>
          </div>
        )}

        {/* Precio */}
        <div style={{ padding: "10px 12px 0" }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "#111827", letterSpacing: "-0.5px" }}>
            {prop.price}
          </span>
        </div>

        {/* Grid datos */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 12px", padding: "8px 12px 0" }}>
          {[
            { icon: "💳", label: "Cuota mensual",    value: prop.monthlyFee },
            { icon: "📅", label: "Fecha de entrega", value: prop.deliveryDate },
            { icon: "🛏️", label: "Habitaciones",     value: prop.beds },
            { icon: "📐", label: "Área",              value: prop.sqft },
            { icon: "🚿", label: "Baños",             value: `${prop.baths} baños` },
          ].map((item) => (
            <div key={item.label}>
              <p style={{ fontSize: 10, color: "#9ca3af", margin: 0, fontWeight: 600 }}>{item.icon} {item.label}</p>
              <p style={{ fontSize: 11, color: "#111827", margin: "1px 0 0", fontWeight: 700 }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding: "10px 12px 12px" }}>
          <a href={prop.url || "#"} target="_blank" rel="noopener noreferrer"
            style={{
              display: "block", textAlign: "center", textDecoration: "none",
              background: zoneColor, color: "#fff", borderRadius: 10,
              padding: "9px 0", fontWeight: 700, fontSize: 13, boxSizing: "border-box",
            }}>
            Ver detalles completos →
          </a>
        </div>

        {/* Flecha apuntando al pin */}
        <div style={{
          position: "absolute", bottom: -ARROW, left: `${pixelPos.x - left}px`,
          transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: `${ARROW}px solid transparent`,
          borderRight: `${ARROW}px solid transparent`,
          borderTop: `${ARROW}px solid #fff`,
          filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.1))",
        }} />
      </div>
    </>
  );
}

// ─── SETTINGS MODAL ───────────────────────────────────────────────────────────
function SettingsModal({ hiddenIds, onToggle, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(3px)",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.22)",

          width: 340,
          maxWidth: "90vw",

          overflow: "hidden",

          animation:
            "popIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards",
        }}
      >
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid #f0f0f0",

            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 800,
                margin: 0,
                color: "#111827",
              }}
            >
              ⚙️ Visibilidad de proyectos
            </h2>

            <p
              style={{
                fontSize: 11,
                color: "#9ca3af",
                margin: "3px 0 0",
              }}
            >
              Solo tú ves esto — el cliente no
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "#f3f4f6",
              border: "none",
              borderRadius: "50%",
              width: 30,
              height: 30,
              cursor: "pointer",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              color: "#6b7280",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            padding: "8px 16px 4px",
            maxHeight: "55vh",
            overflowY: "auto",
          }}
        >
          {properties.map((p) => {
            const zone = getZone(p.zone);
            const hidden = hiddenIds.includes(p.id);

            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: "1px solid #f9fafb",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: hidden
                      ? "#d1d5db"
                      : zone?.color || "#9ca3af",
                  }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      margin: 0,
                      color: hidden ? "#9ca3af" : "#111827",
                      textDecoration: hidden
                        ? "line-through"
                        : "none",

                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.title}
                  </p>

                  <p
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      margin: "1px 0 0",
                    }}
                  >
                    {zone?.label} · {p.price}
                  </p>
                </div>

                <div
                  role="switch"
                  aria-checked={!hidden}
                  onClick={() => onToggle(p.id)}
                  style={{
                    width: 42,
                    height: 24,
                    borderRadius: 12,

                    background: hidden
                      ? "#e5e7eb"
                      : zone?.color || "#3b82f6",

                    cursor: "pointer",
                    position: "relative",
                    flexShrink: 0,
                    transition: "background 0.2s ease",
                    userSelect: "none",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: hidden ? 3 : 21,

                      width: 18,
                      height: 18,
                      borderRadius: "50%",

                      background: "#fff",

                      boxShadow:
                        "0 1px 4px rgba(0,0,0,0.2)",

                      transition: "left 0.2s ease",

                      display: "block",
                      pointerEvents: "none",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ padding: "12px 16px 16px" }}>
          <p
            style={{
              fontSize: 11,
              color: "#9ca3af",
              textAlign: "center",

              background: "#f9fafb",
              borderRadius: 8,
              padding: "8px",
              margin: 0,
            }}
          >
            Los proyectos ocultos no aparecen en el mapa ni en la lista
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR CONTENT ──────────────────────────────────────────────────────────
function SidebarContent({ zones, propsByZone, activeZone, expandedZones, selectedProp,
  onZoneClick, onPropClick }) {
  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
      {zones.map((zone) => {
        const zoneProps  = propsByZone[zone.id] || [];
        const isActive   = activeZone === zone.id;
        const isExpanded = expandedZones[zone.id];

        return (
          <div key={zone.id} style={{ marginBottom: 4 }}>
            <button onClick={() => onZoneClick(zone)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 9,
              padding: "10px 11px", borderRadius: 10,
              border: isActive ? `2px solid ${zone.color}` : "2px solid transparent",
              background: isActive ? `${zone.color}18` : "#f9fafb",
              cursor: "pointer", transition: "all 0.15s ease",
            }}>
              <span style={{
                width: 9, height: 9, borderRadius: "50%", background: zone.color, flexShrink: 0,
                boxShadow: isActive ? `0 0 0 3px ${zone.color}30` : "none", transition: "box-shadow 0.2s",
              }} />
              <span style={{ flex: 1, textAlign: "left", fontWeight: 700, fontSize: 13,
                color: isActive ? zone.color : "#374151" }}>{zone.label}</span>
              <span style={{ fontSize: 10, color: "#9ca3af", background: "#f0f0f0",
                borderRadius: 20, padding: "1px 7px", fontWeight: 600 }}>{zoneProps.length}</span>
              <span style={{ fontSize: 10, color: "#9ca3af", display: "inline-block",
                transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
            </button>

            {isExpanded && (
              <div style={{ paddingLeft: 10, marginTop: 3, display: "flex", flexDirection: "column", gap: 3 }}>
                {zoneProps.length > 0 ? zoneProps.map((p) => (
                  <button key={p.id} onClick={() => onPropClick(p)} style={{
                    background: selectedProp?.id === p.id ? zone.color : "#fff",
                    color: selectedProp?.id === p.id ? "#fff" : "#374151",
                    border: `1px solid ${selectedProp?.id === p.id ? zone.color : "#e5e7eb"}`,
                    borderRadius: 8, padding: "8px 10px",
                    textAlign: "left", cursor: "pointer", transition: "all 0.13s ease", width: "100%",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontWeight: 600, fontSize: 12, flex: 1 }}>{p.title}</span>
                      {p.promo && (
                        <span style={{ fontSize: 9, background: "#fef2f2", color: "#ef4444",
                          borderRadius: 4, padding: "1px 5px", fontWeight: 700, flexShrink: 0 }}>PROMO</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, marginTop: 1,
                      color: selectedProp?.id === p.id ? "rgba(255,255,255,0.7)" : "#9ca3af" }}>
                      {p.beds} · {p.price}
                    </div>
                  </button>
                )) : (
                  <p style={{ fontSize: 12, color: "#d1d5db", textAlign: "center", padding: "6px 0", margin: 0 }}>
                    Sin propiedades aún
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function RealEstateMapPage() {
  const mapContainer   = useRef(null);
  const map            = useRef(null);
  const markersRef     = useRef([]);
  const poiMarkersRef  = useRef([]);
  const mapboxglRef    = useRef(null);
  const hiddenIdsRef   = useRef([]);   // FIX: ref espejo para evitar closures stale

  const [mapReady,       setMapReady]       = useState(false);
  const [selectedProp,   setSelectedProp]   = useState(null);
  const [pinPixelPos,    setPinPixelPos]     = useState(null);
  const [activeZone,     setActiveZone]     = useState(null);
  const [activeStyle,    setActiveStyle]    = useState("light");
  const [expandedZones,  setExpandedZones]  = useState({});
  const [isMobile,       setIsMobile]       = useState(false);
  const [sidebarOpen,    setSidebarOpen]    = useState(true);
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  const [hiddenIds,      setHiddenIds]      = useState([]);
  const [showSettings,   setShowSettings]   = useState(false);
  const [activePOI]      = useState(null);
  const [containerSize,  setContainerSize]  = useState({ w: 0, h: 0 });

  // Sincronizar ref con estado (para callbacks que no se recrean)
  useEffect(() => { hiddenIdsRef.current = hiddenIds; }, [hiddenIds]);

  // Detect mobile + container size
  useEffect(() => {
    const update = () => {
      setIsMobile(window.innerWidth < 768);
      setContainerSize({ w: window.innerWidth, h: window.innerHeight });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const visibleProperties = properties.filter((p) => !hiddenIds.includes(p.id));

  const propsByZone = ZONES.reduce((acc, z) => {
    acc[z.id] = visibleProperties.filter((p) => p.zone === z.id);
    return acc;
  }, {});

  const updatePinPos = useCallback((prop) => {
    if (!map.current || !prop) return;
    const pt = map.current.project(prop.coordinates);
    setPinPixelPos({ x: pt.x, y: pt.y });
  }, []);

  // ── Agregar marcadores — usa hiddenIdsRef para no causar re-init del mapa
  const addMarkers = useCallback((mapboxgl) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const visible = properties.filter((p) => !hiddenIdsRef.current.includes(p.id));

    visible.forEach((property) => {
      const zone  = getZone(property.zone);
      const color = zone?.color || "#111827";
      const el = document.createElement("div");
      el.innerHTML = `
        <div style="
          background:${color};color:#fff;
          padding:6px 13px;border-radius:20px;
          font-size:12px;font-weight:700;white-space:nowrap;cursor:pointer;
          box-shadow:0 4px 14px rgba(0,0,0,0.22);
          border:2.5px solid rgba(255,255,255,0.55);
          transition:transform 0.15s ease,box-shadow 0.15s ease;
          font-family:'DM Sans',system-ui,sans-serif;letter-spacing:-0.3px;
          position:relative;
        "
        onmouseenter="this.style.transform='scale(1.08)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.28)'"
        onmouseleave="this.style.transform='scale(1)';this.style.boxShadow='0 4px 14px rgba(0,0,0,0.22)'"
        >
          ${property.price}
          ${property.promo ? `<span style="
            position:absolute;top:-6px;right:-4px;
            background:#ef4444;color:#fff;font-size:8px;font-weight:900;
            padding:1px 5px;border-radius:10px;border:1.5px solid #fff;
          ">PROMO</span>` : ""}
        </div>`;

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(property.coordinates)
        .addTo(map.current);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        // FIX: primero centramos el mapa con offset para que el card no tape el pin
        const CARD_HALF_H = property.promo ? (CARD_H + 36) / 2 : CARD_H / 2;
        map.current.easeTo({
          center: property.coordinates,
          zoom: Math.max(map.current.getZoom(), 13),
          offset: [0, CARD_HALF_H + 20], // desplaza el pin hacia abajo del centro
          duration: 500,
        });
        // Calculamos posición después del easeTo
        map.current.once("moveend", () => {
          if (!map.current) return;
          const pt = map.current.project(property.coordinates);
          setSelectedProp(property);
          setPinPixelPos({ x: pt.x, y: pt.y });
        });
      });

      markersRef.current.push(marker);
    });
  }, []); // sin dependencias — usa ref

  // ── POI: búsqueda por texto libre en RD
  const loadPOI = useCallback(async (categoryId) => {
    poiMarkersRef.current.forEach((m) => m.remove());
    poiMarkersRef.current = [];
    if (!categoryId || !map.current || !mapboxglRef.current) return;

    const cat = POI_CATEGORIES.find((c) => c.id === categoryId);
    if (!cat) return;

    const mapboxgl = mapboxglRef.current;

    // FIX: buscamos en toda RD (bbox fijo) con límite 25
    // bbox de República Dominicana: aprox -72.0, 17.4, -68.2, 20.0
    const rdBbox = "-72.0,17.4,-68.2,20.0";
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(cat.query)}.json?` +
      `country=do&bbox=${rdBbox}&limit=25&language=es&access_token=${mapboxgl.accessToken}`;

    try {
      const res  = await fetch(url);
      const data = await res.json();
      if (!map.current) return;

      (data.features || []).forEach((feature) => {
        const [lng, lat] = feature.center;
        const el = document.createElement("div");
        el.innerHTML = `
          <div title="${feature.text}" style="
            background:${cat.color};width:30px;height:30px;border-radius:50%;
            display:flex;align-items:center;justify-content:center;font-size:15px;
            box-shadow:0 3px 10px rgba(0,0,0,0.25);border:2.5px solid #fff;cursor:default;
          ">${cat.icon}</div>`;

        const popup = new mapboxgl.Popup({
          offset: 18, closeButton: false, maxWidth: "180px",
        }).setHTML(`
          <div style="font-family:'DM Sans',system-ui,sans-serif;padding:4px 2px;">
            <p style="font-size:12px;font-weight:700;color:#111827;margin:0;">${cat.icon} ${feature.text}</p>
            <p style="font-size:10px;color:#9ca3af;margin:2px 0 0;">
              ${(feature.place_name || "").split(",").slice(1, 3).join(",").trim()}
            </p>
          </div>`);

        const m = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current);

        poiMarkersRef.current.push(m);
      });
    } catch (err) {
      console.error("POI error:", err);
    }
  }, []);

/*   const handlePOIToggle = useCallback((categoryId) => {
    setActivePOI((prev) => {
      const next = prev === categoryId ? null : categoryId;
      loadPOI(next);
      return next;
    });
  }, [loadPOI]); */

  // ── Init mapa
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      const mb = await import("mapbox-gl");
      await import("mapbox-gl/dist/mapbox-gl.css");
      const mapboxgl = mb.default;
      mapboxglRef.current = mapboxgl;
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
      if (!isMounted || !mapContainer.current) return;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_STYLES[0].url,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: false,
      });

      map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");
      map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

      map.current.on("load", () => {
        if (!isMounted) return;
        addMarkers(mapboxgl);
        setMapReady(true);
      });

      map.current.on("move", () => {
        setSelectedProp((prev) => { if (prev) updatePinPos(prev); return prev; });
      });

      map.current.on("click", () => setSelectedProp(null));
    };

    initMap();

    return () => {
      isMounted = false;
      markersRef.current.forEach((m) => m.remove());
      poiMarkersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      poiMarkersRef.current = [];
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, [addMarkers, updatePinPos]);

  // FIX: re-render marcadores cuando cambia hiddenIds — sin loop infinito
  useEffect(() => {
    if (!mapReady || !mapboxglRef.current) return;
    addMarkers(mapboxglRef.current);
    setSelectedProp((prev) => {
      if (prev && hiddenIdsRef.current.includes(prev.id)) return null;
      return prev;
    });
  }, [hiddenIds, mapReady, addMarkers]);

  const changeMapStyle = useCallback((styleId) => {
    if (!map.current || !mapboxglRef.current) return;
    const style = MAP_STYLES.find((s) => s.id === styleId);
    if (!style) return;
    setActiveStyle(styleId);
    map.current.setStyle(style.url);
    map.current.once("style.load", () => {
      addMarkers(mapboxglRef.current);
      if (activePOI) loadPOI(activePOI);
    });
  }, [addMarkers, activePOI, loadPOI]);

  const handleZoneClick = (zone) => {
    const isDeselecting = activeZone === zone.id;
    setActiveZone(isDeselecting ? null : zone.id);
    setExpandedZones((prev) => ({ ...prev, [zone.id]: !prev[zone.id] }));
    setSelectedProp(null);
    map.current?.flyTo({
      center: isDeselecting ? DEFAULT_CENTER : zone.center,
      zoom:   isDeselecting ? DEFAULT_ZOOM  : zone.zoom,
      duration: 900,
    });
  };

  const handlePropClick = (prop) => {
    setSelectedProp(null);
    if (isMobile) { setDrawerExpanded(false); setDrawerOpen(false); }

    const CARD_HALF_H = prop.promo ? (CARD_H + 36) / 2 : CARD_H / 2;
    map.current?.easeTo({
      center: prop.coordinates,
      zoom: Math.max(map.current?.getZoom() || 13, 13),
      offset: [0, CARD_HALF_H + 20],
      duration: 900,
    });
    map.current?.once("moveend", () => {
      if (!map.current) return;
      const pt = map.current.project(prop.coordinates);
      setSelectedProp(prop);
      setPinPixelPos({ x: pt.x, y: pt.y });
    });
    setActiveZone(getZone(prop.zone)?.id || null);
  };

  // FIX: toggle no usa button anidado, usa div con onClick
  const toggleHideId = (id) => {
    setHiddenIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  // Botón reset / centrar mapa
  const resetView = () => {
    setSelectedProp(null);
    map.current?.flyTo({ 
  center: DEFAULT_CENTER, 
  zoom: DEFAULT_ZOOM, 
  bearing: 0,  // ← resetea rotación (norte arriba)
  pitch: 0,    // ← resetea inclinación 3D
  duration: 900 
});
  };

  const hiddenCount = hiddenIds.length;

  const sidebarContent = (
    <SidebarContent
      zones={ZONES}
      propsByZone={propsByZone}
      activeZone={activeZone}
      expandedZones={expandedZones}
      selectedProp={selectedProp}
      onZoneClick={handleZoneClick}
      onPropClick={handlePropClick}
    />
  );

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative",
      fontFamily: "'DM Sans', system-ui, sans-serif", overflow: "hidden" }}>

      <style>{`
        @keyframes popIn {
          from { opacity:0; transform:scale(0.88) translateY(6px); }
          to   { opacity:1; transform:scale(1)    translateY(0); }
        }
        @keyframes slideUp {
          from { transform:translateY(100%); }
          to   { transform:translateY(0); }
        }
        * { box-sizing: border-box; }
      `}</style>

      {/* ════ DESKTOP SIDEBAR ════ */}
      {!isMobile && (
        <>
          <div style={{
            position: "absolute", top: 16, left: 16, bottom: 16, zIndex: 10,
            background: "#fff", borderRadius: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            width: sidebarOpen ? 280 : 0, overflow: "hidden",
            transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
            display: "flex", flexDirection: "column",
          }}>
            <div style={{
              padding: "16px 14px 12px", borderBottom: "1px solid #f0f0f0", flexShrink: 0,
              minWidth: 280, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#111827", letterSpacing: "-0.4px" }}>
                  Mapa Feria BR 2026
                </h1>
                <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
                  {visibleProperties.length} proyectos · {ZONES.length} zonas
                </p>
              </div>
              <div
                role="button"
                onClick={() => setShowSettings(true)}
                title="Configurar visibilidad"
                style={{
                  background: hiddenCount > 0 ? "#fef2f2" : "#f3f4f6",
                  borderRadius: 8, width: 32, height: 32, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, color: hiddenCount > 0 ? "#ef4444" : "#9ca3af",
                  position: "relative", flexShrink: 0, transition: "all 0.15s ease",
                  userSelect: "none",
                }}
              >
                ⚙️
                {hiddenCount > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -4,
                    background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 900,
                    width: 16, height: 16, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1.5px solid #fff",
                  }}>{hiddenCount}</span>
                )}
              </div>
            </div>
            <div style={{ minWidth: 280, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {sidebarContent}
            </div>
          </div>

          <div
            role="button"
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              position: "absolute", top: "50%",
              left: sidebarOpen ? 296 + 16 : 16,
              transform: "translateY(-50%)",
              zIndex: 15, background: "#fff", borderRadius: 10,
              width: 32, height: 48, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "#374151",
              transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
              userSelect: "none",
            }}
          >{sidebarOpen ? "‹" : "›"}</div>
        </>
      )}

      {/* ════ MOBILE ════ */}
      {isMobile && (
        <>
          {!drawerOpen && (
            <div style={{
              position: "absolute", bottom: 28, left: "50%",
              transform: "translateX(-50%)", zIndex: 20,
              display: "flex", gap: 8,
            }}>
              <button onClick={() => { setDrawerOpen(true); setDrawerExpanded(false); }}
                style={{
                  background: "#111827", color: "#fff", border: "none", borderRadius: 50,
                  padding: "12px 20px", fontWeight: 700, fontSize: 13,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.3)", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
                }}>🏠 Ver proyectos</button>
              <button onClick={() => setShowSettings(true)}
                style={{
                  background: hiddenCount > 0 ? "#fef2f2" : "#fff",
                  color: hiddenCount > 0 ? "#ef4444" : "#374151",
                  border: "none", borderRadius: 50, padding: "12px 14px",
                  fontWeight: 700, fontSize: 16,
                  boxShadow: "0 6px 24px rgba(0,0,0,0.18)", cursor: "pointer",
                }}>⚙️</button>
            </div>
          )}

          {drawerOpen && (
            <>
              {drawerExpanded && (
                <div onClick={() => { setDrawerExpanded(false); setDrawerOpen(false); }}
                  style={{ position: "fixed", inset: 0, zIndex: 18,
                    background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }} />
              )}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 19,
                background: "#fff", borderRadius: "20px 20px 0 0",
                boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
                height: drawerExpanded ? "75vh" : "auto", maxHeight: "75vh",
                display: "flex", flexDirection: "column",
                transition: "height 0.35s cubic-bezier(0.4,0,0.2,1)",
                animation: "slideUp 0.3s ease",
              }}>
                <div onClick={() => setDrawerExpanded((v) => !v)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 6, padding: "12px 16px 0", cursor: "pointer", flexShrink: 0 }}>
                  <div style={{ width: 40, height: 4, borderRadius: 4, background: "#d1d5db" }} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    width: "100%", padding: "4px 0 8px" }}>
                    <div>
                      <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#111827" }}>
                        Mapa Inmobiliario 🇩🇴
                      </h2>
                      <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
                        {visibleProperties.length} proyectos · {ZONES.length} zonas
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={(e) => { e.stopPropagation(); setShowSettings(true); }}
                        style={{ background: hiddenCount > 0 ? "#fef2f2" : "#f3f4f6",
                          border: "none", borderRadius: "50%", width: 32, height: 32,
                          cursor: "pointer", fontSize: 14,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: hiddenCount > 0 ? "#ef4444" : "#6b7280" }}>⚙️</button>
                      <button onClick={(e) => { e.stopPropagation(); setDrawerOpen(false); setDrawerExpanded(false); }}
                        style={{ background: "#f3f4f6", border: "none", borderRadius: "50%",
                          width: 32, height: 32, cursor: "pointer", fontSize: 14,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#6b7280" }}>✕</button>
                    </div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid #f0f0f0", flexShrink: 0 }} />
                <div style={{ display: "flex", gap: 8, overflowX: "auto",
                  padding: "10px 14px", flexShrink: 0, scrollbarWidth: "none" }}>
                  {ZONES.map((z) => (
                    <button key={z.id} onClick={() => handleZoneClick(z)} style={{
                      flexShrink: 0,
                      background: activeZone === z.id ? z.color : "#f3f4f6",
                      color: activeZone === z.id ? "#fff" : "#374151",
                      border: "none", borderRadius: 20, padding: "6px 14px",
                      fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                    }}>{z.label}</button>
                  ))}
                </div>
                {drawerExpanded && (
                  <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {sidebarContent}
                  </div>
                )}
                {!drawerExpanded && (
                  <div onClick={() => setDrawerExpanded(true)}
                    style={{ textAlign: "center", padding: "0 0 16px",
                      fontSize: 12, color: "#9ca3af", cursor: "pointer", flexShrink: 0 }}>
                    ↑ Desliza para ver proyectos
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ════ PANEL SUPERIOR DERECHO ════ */}
      <div style={{
        position: "absolute", top: 16, right: 16, zIndex: 10,
        display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end",
      }}>
        {/* Estilos de mapa */}
        <div style={{
          background: "#fff", borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.11)",
          display: "flex", gap: 2, padding: 4,
        }}>
          {MAP_STYLES.map((s) => (
            <button key={s.id} onClick={() => changeMapStyle(s.id)} title={s.label}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 2, padding: isMobile ? "5px 7px" : "6px 10px", borderRadius: 8,
                border: "none", cursor: "pointer", transition: "all 0.15s ease",
                background: activeStyle === s.id ? "#111827" : "transparent",
                color: activeStyle === s.id ? "#fff" : "#6b7280",
              }}>
              <span style={{ fontSize: isMobile ? 16 : 18 }}>{s.icon}</span>
              {!isMobile && <span style={{ fontSize: 9, fontWeight: 700 }}>{s.label}</span>}
            </button>
          ))}
        </div>

        {/* POI toggles — solo 3 categorías */}
        {/* <div style={{
          background: "#fff", borderRadius: 12,
          boxShadow: "0 4px 20px rgba(0,0,0,0.11)",
          display: "flex", gap: 2, padding: 4,
        }}> */}
         {/*  {POI_CATEGORIES.map((cat) => {
            const isOn = activePOI === cat.id;
            return (
              <button key={cat.id} onClick={() => handlePOIToggle(cat.id)} title={cat.label}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 2, padding: isMobile ? "5px 7px" : "6px 10px", borderRadius: 8,
                  border: "none", cursor: "pointer", transition: "all 0.15s ease",
                  background: isOn ? cat.color : "transparent",
                  color: isOn ? "#fff" : "#6b7280",
                }}>
                <span style={{ fontSize: isMobile ? 16 : 18 }}>{cat.icon}</span>
                {!isMobile && <span style={{ fontSize: 9, fontWeight: 700 }}>{cat.label}</span>}
              </button>
            );
          })} 
           </div>
           */}
      </div>

      {/* ════ BOTÓN RESET / CENTRAR (bottom-right, encima de los controles de zoom) ════ */}
      <button
        onClick={resetView}
        title="Centrar mapa"
        style={{
          position: "absolute",
          bottom: isMobile ? 100 : 90,
          right: 16,
          zIndex: 10,
          background: "#fff",
          border: "none",
          borderRadius: 10,
          width: 36,
          height: 36,
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          transition: "transform 0.15s ease",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        🎯
      </button>

      {/* Mapa */}
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* Card popup */}
      <PropertyCard
        prop={selectedProp}
        pixelPos={pinPixelPos}
        onClose={() => setSelectedProp(null)}
        isMobile={isMobile}
        containerW={containerSize.w}
        containerH={containerSize.h}
      />

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          hiddenIds={hiddenIds}
          onToggle={toggleHideId}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Loading */}
      {!mapReady && (
        <div style={{
          position: "absolute", inset: 0, background: "#f9fafb",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5,
        }}>
          <p style={{ color: "#9ca3af", fontSize: 14, fontWeight: 600 }}>Cargando mapa…</p>
        </div>
      )}
    </div>
  );
}