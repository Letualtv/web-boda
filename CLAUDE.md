# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

Sitio web de boda (`web-boda`) servido localmente con XAMPP en Windows.

- **URL local:** `http://localhost/web-boda/`
- **Servidor:** Apache + PHP (XAMPP en `C:\xampp`)
- **Base de datos:** MySQL a través de phpMyAdmin (`http://localhost/phpmyadmin/`)

## Entorno de desarrollo

Iniciar/detener servidores desde el **XAMPP Control Panel** o mediante PowerShell:

```powershell
# Iniciar Apache y MySQL
& "C:\xampp\xampp_start.exe"

# Detener
& "C:\xampp\xampp_stop.exe"
```

Verificar que Apache y MySQL están activos antes de trabajar con el sitio.

## Estructura esperada

Este repositorio aún está vacío. A medida que se añada código, la estructura típica para un sitio PHP en XAMPP sería:

```
web-boda/
├── index.php          # Página principal
├── assets/
│   ├── css/
│   ├── js/
│   └── img/
├── includes/          # Helpers PHP reutilizables (conexión BD, funciones)
├── pages/             # Páginas del sitio
└── admin/             # Panel de administración (opcional)
```

## Convenciones

- PHP sin framework (PHP nativo), a menos que se indique lo contrario.
- Conexión a base de datos mediante PDO con prepared statements — nunca concatenar SQL con input de usuario.
- Archivos de configuración con credenciales (contraseña de BD, etc.) en un archivo separado fuera del control de versiones (añadirlo a `.gitignore`).
