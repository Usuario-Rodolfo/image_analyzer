/*
  Análise e Desenvolvimento de Sistemas
  Disciplina: Representação de Imagens em Computadores

  Conceito de Pixels e Coordenadas:
  - Cada pixel em uma imagem é identificado por uma coordenada (X, Y).
  - A coordenada X (horizontal) representa a coluna, onde X = 0 é a primeira coluna à esquerda.
  - A coordenada Y (vertical) representa a linha, onde Y = 0 é a primeira linha no topo.
  - Juntas, (X, Y) formam o endereço único de cada pixel na imagem.
*/

document.addEventListener('DOMContentLoaded', () => {
    // Acessa os elementos do HTML
    const imageLoader = document.getElementById('imageLoader');
    const imageCanvas = document.getElementById('imageCanvas');
    const ctx = imageCanvas.getContext('2d');
    const magnifierCanvas = document.getElementById('magnifierCanvas');
    const magCtx = magnifierCanvas.getContext('2d');
    const zoomInButton = document.getElementById('zoomIn');
    const zoomOutButton = document.getElementById('zoomOut');
    const colorPicker = document.getElementById('colorPicker');
    const pixelInfo = document.getElementById('pixelInfo');
    const clickedPixelInfo = document.getElementById('clickedPixelInfo');

    let img = new Image();
    let scale = 1;
    let originalImageData;
    const magnifierSize = 10;
    
    // Desativa o suavizador de imagem para mostrar os pixels quadrados
    magCtx.imageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    // Função para converter RGB para HEX
    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    // --- FUNÇÃO DE CARREGAMENTO DA IMAGEM ---
    imageLoader.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            img.onload = () => {
                originalImageData = img;
                drawImage();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
    // --- FIM DA FUNÇÃO DE CARREGAMENTO ---

    // Evento para o zoom in
    zoomInButton.addEventListener('click', () => {
        scale *= 1.2;
        drawImage();
    });

    // Evento para o zoom out
    zoomOutButton.addEventListener('click', () => {
        scale /= 1.2;
        drawImage();
    });

    // Evento para a lupa e informações do pixel ao mover o mouse
    imageCanvas.addEventListener('mousemove', (e) => {
        if (!originalImageData) {
            magnifierCanvas.style.display = 'none';
            return;
        }
        
        const rect = imageCanvas.getBoundingClientRect();
        const canvasX = Math.floor(e.clientX - rect.left);
        const canvasY = Math.floor(e.clientY - rect.top);

        // Oculta a lupa e as informações se o mouse sair da área da imagem
        if (canvasX < 0 || canvasX >= imageCanvas.width || canvasY < 0 || canvasY >= imageCanvas.height) {
            magnifierCanvas.style.display = 'none';
            pixelInfo.innerHTML = '<p>Passe o mouse sobre a imagem para ver os detalhes do pixel.</p>';
            return;
        }

        magnifierCanvas.style.display = 'block';

        // Posiciona a lupa no mouse
        magnifierCanvas.style.left = `${e.clientX - rect.left + 20}px`;
        magnifierCanvas.style.top = `${e.clientY - rect.top + 20}px`;

        // Pega os dados do pixel para exibir as informações
        const pixel = ctx.getImageData(canvasX, canvasY, 1, 1);
        const data = pixel.data;
        const r = data[0];
        const g = data[1];
        const b = data[2];

        pixelInfo.innerHTML = `
            <p><strong>Coordenadas:</strong> X: ${canvasX}, Y: ${canvasY}</p>
            <p><strong>Cor (RGB):</strong> R: ${r}, G: ${g}, B: ${b}</p>
        `;

        // Desenha na lupa
        magCtx.clearRect(0, 0, magnifierCanvas.width, magnifierCanvas.height);
        
        magCtx.drawImage(
            imageCanvas,
            canvasX - magnifierSize / 2,
            canvasY - magnifierSize / 2,
            magnifierSize,
            magnifierSize,
            0,
            0,
            magnifierCanvas.width,
            magnifierCanvas.height
        );

        // Desenha a cruz X/Y no centro da lupa
        const center = magnifierCanvas.width / 2;
        magCtx.strokeStyle = 'red';
        magCtx.lineWidth = 1;

        magCtx.beginPath();
        magCtx.moveTo(0, center);
        magCtx.lineTo(magnifierCanvas.width, center);
        magCtx.stroke();

        magCtx.beginPath();
        magCtx.moveTo(center, 0);
        magCtx.lineTo(center, magnifierCanvas.height);
        magCtx.stroke();
    });

    // Evento para "fixar" a cor do pixel ao clicar
    imageCanvas.addEventListener('click', (e) => {
        if (!originalImageData) return;
        
        const rect = imageCanvas.getBoundingClientRect();
        const canvasX = Math.floor(e.clientX - rect.left);
        const canvasY = Math.floor(e.clientY - rect.top);
        
        const pixel = ctx.getImageData(canvasX, canvasY, 1, 1);
        const data = pixel.data;
        const r = data[0];
        const g = data[1];
        const b = data[2];

        colorPicker.value = rgbToHex(r, g, b);

        // Altera o HTML do span para o formato de parágrafos
        clickedPixelInfo.innerHTML = `
            <strong>Coordenadas:</strong> X: ${canvasX}, Y: ${canvasY}<br>
            <strong>Cor (RGB):</strong> R: ${r}, G: ${g}, B: ${b}
        `;
    });

    // Função para desenhar a imagem principal no canvas
    function drawImage() {
        if (!originalImageData) return;
        
        imageCanvas.width = originalImageData.width * scale;
        imageCanvas.height = originalImageData.height * scale;

        ctx.drawImage(originalImageData, 0, 0, imageCanvas.width, imageCanvas.height);
    }
});