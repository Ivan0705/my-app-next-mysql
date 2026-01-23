"use client";
import "./page.css";
import SqlConverterPage from "./pages/sqlconverter/sqlconverter";
import { APITest } from "./shared/ui/ApiTestWithPython";
// <APITest /> Для тестирования API из Python
export default function Home() {
  return (
    <div>
      <SqlConverterPage/>
    </div>
  );
}
