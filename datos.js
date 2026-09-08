const regionesData = [
  { region: "Región Metropolitana", comunas: ["Santiago", "Puente Alto", "Maipú"] },
  { region: "Región de Valparaíso", comunas: ["Valparaíso", "Viña del Mar"] }
];

const productosIniciales = [
  {
    id: "URB001",
    nombre: "Polerón Oversize Hoodie",
    precio: 29990,
    stock: 10,
    stockCritico: 2,
    descripcion: "Polerón de corte amplio con capucha e interior suave para un look urbano cómodo.",//Se le saco lo de ajustable ya que era de mientras el texto y decidi colocar un poleron mas normal pero oversize
    material: "Algodón 100%",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSTt2Y6t0-9FY60nDY8MUmk_99Tbw8pxxR1MTjNCfQcg&s=10" //Se cambio la imagen del producto ya que la que estaba era una de prueba generica//
  },
  {
    id: "URB002",
    nombre: "Pantalón Oversize",//En vez de un pantalon cargo opte por uno oversize ya que asi se hace el conjunto con el poleron y lo compren
    precio: 34990,
    stock: 8,
    stockCritico: 3,
    descripcion: "Pantalón Oversize de tiro medio con bolsillos funcionales y silueta relajada para el uso diario.",
    material: "Sarga de algodón",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRMkgRXffxVzlFd3ditJA-mVDHek44FfC7dpLMm5YtrQ&s=10"//Se cambia la imagen del producto ya que era una de prueba la anterior
  },
  {
    id: "URB003",
    nombre: "Mochila Cordura",
    precio: 49990,
    stock: 15,
    stockCritico: 5,
    descripcion: "Mochila resistente con compartimento principal amplio y bolsillos de acceso rápido.",
    material: "Tela Cordura",
    img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60"
  },
  {
    id: "URB004",
    nombre: "Polera Urbana",
    precio: 18990,
    stock: 20,
    stockCritico: 5,
    descripcion: "Polera de calce regular con gráfico frontal y tejido ligero para combinar en cualquier temporada.",
    material: "Algodón 100%",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRopC8QhHmsTrmZipIQ8_hIlp6O4luUYKxwMOM-2OFhzA&s=10"//Se cambia la imagen del producto ya que era una de prueba la anterior
  },
  {
    id: "URB005",
    nombre: "Zapatillas Urbanas Skaters",
    precio: 59990,
    stock: 7,
    stockCritico: 2,
    descripcion: "Zapatillas de perfil bajo, amortiguación ligera y una suela pensada para andar en skate.",//Se decidio cambiar el producto al final 
    material: "Textil y goma",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4YPJ325TLXnJshKUzI1R_owl9_Gn5js0KXpuTnkcOuQ&s=10"//Se cambia la imagen del producto ya que era una de prueba la anterior
  },
  {
    id: "URB006",
    nombre: "Chaqueta Mezclilla Urbana",
    precio: 42990,
    stock: 6,
    stockCritico: 2,
    descripcion: "Chaqueta de mezclilla con estructura firme, bolsillos frontales y terminación urbana clásica.",
    material: "Denim de algodón",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQjaaIVgiz3MelEdalK9RNi_qHVWp2tJ2HMdDEvNtgyw&s=10"//Se cambia la imagen del producto ya que era una de prueba la anterior
  },
  {
    id: "URB007",
    nombre: "Conjunto Urbano",
    precio: 30990,//Se cambia el precio del producto ya que el producto cambio y ahora es un conjunto
    stock: 16,
    stockCritico: 4,
    descripcion: "Conjunto Urbano negro , como y especial para usar en el dia.",
    material: "Algodón y poliéster",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt1LSl0-vmtALD_tVZx4Q34POh3uIlDaz8GRO7EZydRQ&s=10"//Se cambia la imagen del producto ya que era una de prueba la anterior
  },
  {
    id: "URB008",
    nombre: "Polerón Oversize",
    precio: 32990,
    stock: 9,
    stockCritico: 3,
    descripcion: "Polerón urbano, con capucha y comodo para tu uso del dia a dia .",
    material: "Algodón ",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEgGoHoynyw-Si5maxr58UaCpAm3fNne1RKim52mAnXA&s=10"//Se cambia la imagen del producto ya que era una de prueba la anterior
  }
];
