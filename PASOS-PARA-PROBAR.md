# Pasos para Probar el Login (Desarrollo)

## Lo que cambió:

1. **Frontend**: Los componentes Lit (TypeScript) ahora se compilan a JavaScript antes de servirse
2. **Backend**: También se compila con esbuild (más rápido que tsc)
3. **Un solo puerto**: Todo funciona desde http://localhost:3003

## Comandos para ejecutar:

### Opción 1: Comando único (recomendado)
```bash
pnpm dev
```

Esto hace:
- Compila `/public/js/main.ts` → `/public/js/main.js` (componentes Lit)
- Compila `/src/server.ts` → `/dist/server.js` (backend)
- Arranca el servidor en puerto 3003

### Opción 2: Paso a paso (si la opción 1 falla)
```bash
# 1. Compilar frontend
pnpm compile:lit

# 2. Compilar backend
pnpm compile:backend

# 3. Arrancar servidor
node dist/server.js
```

## Qué esperar:

En la consola deberías ver:
```
✅ Frontend TypeScript compiled to JavaScript
✅ Backend compiled
🔌 Initializing S3 Bucket Repository...
   - Added Provider: MinIO (minio) ✅
📁 Serving static files from: C:\...\public
🌍 Environment: DEVELOPMENT
🚀 Server running at http://localhost:3003
   Open: http://localhost:3003/login
```

## Pruebas:

1. **Abrir navegador**: http://localhost:3003/login
2. **Verificar en consola del navegador (F12)**:
   - NO debe haber errores de "Cannot use import statement"
   - NO debe haber errores 404 para `/js/main.js`
   - DEBE cargar los componentes Lit correctamente

3. **Login**:
   - Usuario: `admin`
   - Password: `admin`
   - Debe aparecer el formulario
   - Al hacer submit debe redirigir a `/manager`

## Si algo falla:

### Error: "Cannot find module 'C:\...\dist\server.js'"
**Solución**: 
```bash
pnpm compile:backend
```

### Error en navegador: "Failed to resolve module specifier 'lit'"
**Causa**: El archivo `main.js` no se compiló correctamente
**Solución**:
```bash
pnpm compile:lit
```
Luego refresca el navegador (Ctrl+F5)

### No se ve el formulario de login (página en blanco)
**Revisar**:
1. Consola del navegador (F12) - buscar errores
2. Network tab - verificar que `/js/main.js` carga con status 200
3. Verificar que el archivo existe: `public/js/main.js`

### El servidor no arranca o se queda colgado
**NO uses** `nodemon` por ahora (tiene problemas con TypeScript)
**USA**: `node dist/server.js` directamente después de compilar

## Archivos clave modificados:

- ✅ `public/login.html` - ahora carga `/js/main.js` (no `.ts`)
- ✅ `public/manager.html` - ahora carga `/js/main.js` (no `.ts`)
- ✅ `build-frontend.js` - compila Lit components con esbuild
- ✅ `build-backend.js` - compila backend con esbuild
- ✅ `package.json` - scripts actualizados
- ✅ `tsconfig.json` - simplificado (quitó opciones problemáticas)

## Próximos pasos (si funciona):

1. ✅ Login funciona
2. ✅ Manager carga
3. ✅ Buckets se ven
4. ✅ Explorer funciona
5. ✅ Modales abren/cierran
6. 🚀 Preparar para producción con Vite build
