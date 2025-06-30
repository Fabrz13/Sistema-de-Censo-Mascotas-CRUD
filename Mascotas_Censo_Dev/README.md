🐾 API de Gestión de Mascotas y Dueños 🏡
<p align="center"> 
  <strong>Una API RESTful construida con Laravel 10 y MySQL para el censo y gestión de mascotas y sus dueños</strong> 
</p>

<p align="center"> 
  <img src="https://img.shields.io/badge/Laravel-10.x-red?style=flat&logo=laravel" alt="Laravel"> 
  <img src="https://img.shields.io/badge/PHP-8.1%2B-blue?style=flat&logo=php"> 
  <img src="https://img.shields.io/badge/MySQL-8.0+-orange?style=flat&logo=mysql"> 
  <img src="https://img.shields.io/badge/Sanctum-Auth-purple?style=flat"> 
  <img src="https://img.shields.io/badge/React-18-blue?style=flat&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=flat"> 
</p>

🚀 Requisitos Previos
✅ PHP 8.1 o superior

✅ Composer 2.x

✅ MySQL 8.0 

✅ Laravel 10.x

✅ React 18.x + Vite 

⚙️ Instalación

# 1. Clona el repositorio
git clone [url-del-repositorio]
cd censo-mascotas-api

# 2. Instala dependencias
composer install

# 3. Configura el entorno
cp .env.example .env

✍️ Edita el archivo .env con tus credenciales:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=censo_mascotas
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña

APP_URL=http://localhost:8000

# 4. Genera la clave de aplicación
php artisan key:generate

# 5. Configura Sanctum para autenticación
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# 6. Ejecuta migraciones y seeders
php artisan migrate --seed

# 7. Crea enlace simbólico para almacenamiento
php artisan storage:link

# 8. Inicia el servidor
php artisan serve

🌐 La API estará disponible en:
http://localhost:8000/api

🔗 Endpoints Principales
🔐 Autenticación
Método	Endpoint	Descripción
POST	/api/register	Registrar nuevo dueño
POST	/api/login	Iniciar sesión
POST	/api/logout	Cerrar sesión (requiere token)

🧑 Dueños
Método	Endpoint	Descripción
GET	/api/owner	Obtener dueño actual (autenticado)
GET	/api/owners	Listar todos los dueños (admin)

🐶 Mascotas
Método	Endpoint	Descripción
GET	/api/pets	Listar todas las mascotas
POST	/api/pets	Crear nueva mascota (requiere token)
GET	/api/pets/{id}	Mostrar mascota específica
PUT	/api/pets/{id}	Actualizar mascota (requiere token)
DELETE	/api/pets/{id}	Deshabilitar mascota (requiere token)

👤 Perfil
Método	Endpoint	Descripción
GET	/api/profile	Obtener perfil (requiere token)
PUT	/api/profile	Actualizar perfil (requiere token)
POST	/api/profile/disable	Deshabilitar cuenta (requiere token)

🛠️ Características Especiales

Autenticación JWT con Sanctum - Seguridad robusta para todas las operaciones

Eliminación lógica - Los registros se marcan como "DESHABILITADO" en lugar de borrarse

Subida de imágenes - Soporte para fotos de perfil y de mascotas

Reportes - Sistema de reportes de vacunación

Relaciones completas - Dueños pueden tener múltiples mascotas

Validaciones - Estrictas validaciones en todos los endpoints

🧑‍💻 Autor
Desarrollado por Fabrizio Castro
📧 fabriziocastros2003@gmail.com
🔗 Fabrz13
