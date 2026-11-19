// Resolución — el control de idioma es un par de enlaces reales renderizado
// en el servidor (Header.astro + LanguageToggle.astro): cada idioma apunta a
// su ruta y el activo lleva aria-current="true". No hay menú ni JS de cliente.
// Este archivo queda sin consumidores: el padre debe borrarlo en la poda S2.
