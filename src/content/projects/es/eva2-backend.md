---
title: "API de Gestión de Reservas de Restaurante"
description: "API REST profesional para gestión de reservas de restaurante construida con Django y PostgreSQL"
tags: ["Django", "REST API", "PostgreSQL", "Docker", "JWT"]
featured: false
publishDate: 2025-10-16
image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop"
githubUrl: "https://github.com/sebitabravo/eva2-backend"
order: 3
---

# API de Gestión de Reservas de Restaurante

Una API REST profesional para la gestión de reservas de restaurante, construida con Django y Django Rest Framework. Cuenta con autenticación completa, limitación de tasa y estadísticas avanzadas para sistemas de reservas escalables.

## Características Principales

- **API pública de lectura** (100 peticiones/hora) para ver reservas
- **Acceso de escritura solo para administradores** (20 peticiones/hora) para gestionar recursos
- **Gestión de recursos multiusuario** con autenticación segura
- **Estadísticas y métricas avanzadas** para análisis de reservas
- **Validación robusta** con manejo completo de errores
- **Limitación de tasa** para protección de la API
- **Documentación Swagger/OpenAPI** para fácil integración
- **Autenticación JWT** con soporte de tokens de actualización

## Tecnologías

- **Backend**: Django 5.1.3, Django REST Framework 3.15.2
- **Base de datos**: PostgreSQL 16
- **Autenticación**: JWT con tokens de actualización
- **Servidor**: Gunicorn
- **Despliegue**: Docker

## Aspectos Únicos

- Opciones de despliegue flexibles (local y Docker)
- Scripts de monitoreo de recursos
- Limitación y throttling avanzado de tasa
- Implementaciones de seguridad completas
- Configuración basada en entorno
