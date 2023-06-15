// Chiquitas
const pieces = {
	king: '♔',
	queen: '♕',
	rook: '♖',
	bishop: '♗',
	knight: '♘',
	pawn: '♙',
	bking: '&#9818;',
	bqueen: '&#9819;',
	bpawn: '&#9823;',
	brook: '&#9820;',
	bbishop: '&#9821;',
	bknight: '&#9822;',
};

// Definindo a matriz do tabuleiro
const board = [
	['brook', 'bknight', 'bbishop', 'bqueen', 'bking', 'bbishop', 'bknight', 'brook'],
	['bpawn','bpawn','bpawn','bpawn','bpawn','bpawn','bpawn','bpawn'],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['', '', '', '', '', '', '', ''],
	['pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn', 'pawn'],
	['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
];

const wpieces = ['pawn','bishop','knight','rook','queen','king'];
const bpieces = ['bpawn','bbishop','bknight','brook','bqueen','bking'];

// Variáveis para controlar o movimento das peças
let selectedPiece = null;
let selectedCell = null;
let currentRow = null;
let currentCol = null;
let pieceAux = null;
let space = null;
let turn = 1;
let check = 0;

// Variáveis de localização do rei
let kingw1, kingw2, kingb1, kingb2;

// Variáveis para o roque
let WkingMoved = 0;
let BkingMoved = 0;
let castleFlag = 0;
let RWMoved = [0,0]; 
let RBMoved = [0,0];

// Variáveis para gravar o histórico dos lances

let history = int[100][8][8];

// Variáveis para mensagens na tela
let msgTurn = 'Bom jogo!';
let errTurn = 0;
let errMsg = 'Grande dia.';

// Criando o tabuleiro de xadrez
const chessBoard = document.getElementById('board');

for (let row = 0; row < 8; row++) {
  	for (let col = 0; col < 8; col++) {
		const cell = document.createElement('div');
		cell.classList.add('cell');

		if ((row + col) % 2 === 0) {
			cell.classList.add('white');
		} else {
			cell.classList.add('black');
		}

		const piece = document.createElement('span');
		piece.innerHTML = getPieces(row, col);

		cell.appendChild(piece);
		chessBoard.appendChild(cell);

		// Adicionando evento de click para selecionar e mover as peças
		cell.addEventListener('click', () => {
			if (selectedPiece === null && board[row][col] !== '') {
				selectedPiece = board[row][col];
				selectedCell = cell;
				pieceAux = piece;
				currentRow = row;
				currentCol = col;
				if(isYourTurn(row, col)){
					validMoves();
					pieceAux.setAttribute('id','selected');
				}
			} else if (selectedPiece !== null) {
				if(isYourTurn(currentRow, currentCol)){
					if(canICastle(row,col)){
						if(errTurn===0){ errTxt.innerHTML = getMsg('Grande dia.')}
						space = piece;
						//selectedCell.classList.add(canICastle(row,col));
						castleMove(row, col);
						turnFlipper();
						isChecked();
					}else{
						castleFlag = 0;
						check = 0;
						if (isValidMove(row, col, selectedPiece.toLowerCase())) {
							if(avoidChecks(row, col)){
								if(errTurn===0){ errTxt.innerHTML = getMsg('Grande dia.')}
								space = piece;
								checkHandler();
								selectedCell.classList.add(WkingMoved);
								movePiece(row, col);
								castleFlagHandler(castleFlag);
								turnFlipper();
								isChecked();
								checkHandler();
							}
						}
					}}
					if(errTurn!==0){
						let arr = ['brancas', 'negras']
						errMsg='Não é a vez das '+ arr[(turn%2)] + ' jogarem.';
						errTurn=0;
						errTxt.innerHTML = getMsg(errMsg);
					}
					currentRow = null;
					currentCol = null;
					clearSelection();
				}
		});
  	}
}

// Declaração das mensagens como elementos HTML

const errBox = document.getElementById('err');
const errTxt = document.createElement('h3');
errTxt.classList.add('errtxt');
errTxt.innerHTML = getMsg(errMsg);
errBox.appendChild(errTxt);

const msgBox = document.getElementById('msg');
const msgTxt = document.createElement('h2');
msgTxt.classList.add('msgtxt');
msgTxt.innerHTML = getMsg(msgTurn);
msgBox.appendChild(msgTxt);

//------------------------------------------- FUNÇÕES

// Função para obter as peças corretas nas posições do tabuleiro
function getPieces(row, col) {
  	return pieces[board[row][col]] || '';
}

// Função para verificar se o lance vai capturar as próprias peças
function killYourFriends(row, col, piece){
	if((wpieces.indexOf(piece) > -1 && wpieces.indexOf(board[row][col]) > -1) || 
	(bpieces.indexOf(piece) > -1 && bpieces.indexOf(board[row][col]) > -1)){
		return true;
	}
}

// Função para verificar se o movimento é válido
function isValidMove(row, col, piece) {

	if (currentRow === row && currentCol === col){
		return false;
	}

	if(killYourFriends(row, col, piece)){
		return false;
	}

	if (piece === 'pawn') {
		if(isPathBlocked(currentRow,currentCol,row,col)) return false;
		if (currentRow === row + 1 && currentCol === col && board[row][col] === ''){

		return true;
		} else if (currentRow === 6 && Math.abs(currentRow - row) === 2 && currentCol === col 
			&& board[row][col] === '') {

		return true;
		} else if (currentRow === row + 1 && Math.abs(currentCol - col) === 1 && board[row][col] !== '') {

		return true;
		}
	}
  
	if(piece === 'bpawn'){
		if(isPathBlocked(currentRow,currentCol,row,col)) return false;
		if (currentRow === row - 1 && currentCol === col && board[row][col] === ''){
			return true;
		} else if(currentRow === 1 && Math.abs(currentRow - row) === 2 && currentCol === col 
		&& board[row][col] === ''){
			return true;
		} else if(currentRow === row - 1 && Math.abs(currentCol - col) === 1 && board[row][col] !== ''){
			return true;
		}
	}
  
	if (piece === 'knight' || piece === 'bknight') {
		if(currentRow !== row && currentCol !== col && Math.abs(currentRow - row) + Math.abs(currentCol - col) === 3){
			return true;
		}
	}
  
	if (piece === 'bishop' || piece === 'bbishop') {
		if (isPathBlocked(currentRow,currentCol,row,col)) return false;
		if (Math.abs(currentRow - row) === Math.abs(currentCol - col)){
			return true;
		}
	}
   
    if (piece === 'rook' || piece === 'brook') {
		if (isPathBlocked(currentRow,currentCol,row,col)) return false;
		if (currentRow === row || currentCol === col){
			if(piece === 'rook'){
				if(col === 0 && RWMoved[0] === 0){
					castleFlag = 1;
				}else if (col === 7 && RWMoved[1] === 0){
					castleFlag = 2;
				}
			}else {
				if(col === 0 && RBMoved[0] === 0){
					castleFlag = 3;
				}else if (col === 7 && RBMoved[1] === 0){
					castleFlag = 4;
				}
			}
			return true;
		}
	}
   
    if (piece === 'queen' || piece === 'bqueen') {
		if (isPathBlocked(currentRow,currentCol,row,col)) return false;
	   	if (currentRow === row || currentCol === col){
			return true;
		} else if (Math.abs(currentRow - row) === Math.abs(currentCol - col)){
			return true;
		}
	}
   
    if (piece === 'king' || piece === 'bking') {
		if(Math.sqrt(Math.abs(currentRow - row)**2 + Math.abs(currentCol - col)**2) < 2){
			if(piece === 'king' && WkingMoved === 0){
				castleFlag = 5;
			} else if(piece === 'bking' && BkingMoved === 0){
				castleFlag = 6;
			}
			return true;
		}
	}

  return false;
}

// Função para mover a peça para uma nova posição
function movePiece(row, col) {
	board[row][col] = selectedPiece;
	board[currentRow][currentCol] = '';
	pieceAux.innerHTML = getPieces(currentRow,currentCol);
	space.innerHTML = getPieces(row, col);
}

// Função para limpar a seleção da peça
function clearSelection() {
	selectedPiece = null;
	pieceAux.removeAttribute('id');
	pieceAux = null;
	var elems = document.getElementsByClassName('cell'), i;
    for (i in elems) {
		elems[i].classList.remove('valid');
	}
}

// Função para mostrar lances válidos após selecionar uma peça
function validMoves(){
	var elems = document.getElementsByClassName('cell');
	for (let row = 0; row < 8; row++) {
		for (let col = 0; col < 8; col++) {		
			if(isValidMove(row, col, selectedPiece.toLowerCase())){
				if(avoidChecks(row, col)){
					elems[row*8 + col].classList.add('valid');
				}
			}
			else if(canICastle(row, col)){
				elems[row*8 + col].classList.add('valid');
			}
		}
	}
}

// Função para verificar se há peças bloqueando o movimento de outra peça
function isPathBlocked(currentRow1, currentCol1, row1, col1) {
	const deltaX = Math.abs(row1 - currentRow1);
	const deltaY = Math.abs(col1 - currentCol1); 
	var stepX, stepY;
	if(deltaX!==0){ 
		if(row1>currentRow1) stepX = 1;
		else stepX = -1;
	}else{
		stepX = 0;
	}

	if(deltaY!==0){ 
		if(col1>currentCol1) stepY = 1;
		else stepY = -1; 
	} else{
		stepY = 0;
	}
  
	let x = currentRow1 + stepX; 
	let y = currentCol1 + stepY; 
  
	while (x !== row1 || y !== col1) {
		if(x > 7 || x < 0 || y > 7 || y < 0) break;
		if (board[x][y] !== '') {
			return true; // Há uma peça bloqueando o caminho
		}
		x += stepX;
		y += stepY;
	}
  
	return false; // O caminho está livre de peças
}

// Função para mostrar quem faz o próximo lance
function turnFlipper(){
	var player = '';
	if(turn%2===0) player = 'Branquelas';
	else player = 'Neguinhas';
	msgTurn = player + ' jogam';
	msgTxt.innerHTML = getMsg(msgTurn);
	turn++;
	// SE UM DIA QUISER INVERTER O TABULEIRO, EIS O CÓDIGO AMIGUINHO. RESOLVA OS BOS DEPOIS.
	// board.reverse();
	// var elems = document.getElementsByClassName('cell');
	// for (let row = 0; row < 8; row++) {
	// 	for (let col = 0; col < 8; col++) {
	// 		elems[8*row + col].innerHTML = getPieces(row,col);
	// 	}
	// }
}

// Função para obter mensagem no HTML
function getMsg(msg){
	return msg;
}

// Função para checar se é o turno de quem mexe
function isYourTurn(row, col){
		if(wpieces.indexOf(board[row][col]) > -1){
			if(turn % 2 === 0){
				errTurn = 1;
				return false;
			}
		}
		if(bpieces.indexOf(board[row][col]) > -1){
			if(turn % 2 !== 0){
				errTurn = 1;
				return false;
			}
		}
	return true;
}

// Função para encontrar o rei
function whereIsTheKing(){
	for(let j=0;j<8;j++){
		for(let ji=0;ji<8;ji++){
			if(board[j][ji] === 'bking'){
				kingb1 = j;
				kingb2 = ji;
			}
			else if(board[j][ji] === 'king'){
				kingw1 = j;
				kingw2 = ji;
			}
		}
	}
}

//Função para verificar se o jogador está em xeque
function isChecked(){
	let aux, aux2, result;
	aux = currentRow;
	aux2 = currentCol;
	whereIsTheKing();
	for(let j=0;j<8;j++){
		for(let ji=0;ji<8;ji++){
			if(turn%2!==0){
				if(bpieces.indexOf(board[j][ji]) > -1){
					currentRow = j;
					currentCol = ji;
					result = isValidMove(kingw1, kingw2, board[j][ji]);
					currentRow = aux;
					currentCol = aux2;
					if(result){
						check = 1;
						return true;
					}
					
				}
			}
			else{
				if(wpieces.indexOf(board[j][ji]) > -1){
					currentRow = j;
					currentCol = ji;
					result = isValidMove(kingb1, kingb2, board[j][ji]);
					currentRow = aux;
					currentCol = aux2;
					if(result){
						check = 2;
						return true;
					}
				}
			}
		}
	}
	return false;
}

// Função para colorir a casa do rei de vermelho
function beCareful(row, col){
	var squares = document.getElementsByClassName('cell');
	squares[row*8 + col].classList.add('checked');
}

// Função para lidar com o xeque a cada turno
function checkHandler(){
	whereIsTheKing();
	var elems = document.getElementsByClassName('cell');
	elems[kingw1*8 + kingw2].classList.remove('checked');
		if(check === 1){
			beCareful(kingw1,kingw2);
			elems[kingb1*8 + kingb2].classList.remove('checked');
		} else if (check === 2){
			beCareful(kingb1,kingb2);
			elems[kingw1*8 + kingw2].classList.remove('checked');
		} else{
			elems[kingb1*8 + kingb2].classList.remove('checked');
			elems[kingw1*8 + kingw2].classList.remove('checked');
		}
}

// Função para evitar lances que coloquem o rei em xeque (próprio rei e cravadas)
function avoidChecks(row, col){
	let aux2 = board[row][col];
	let aux = board[currentRow][currentCol];
	board[currentRow][currentCol] = '';
	board[row][col] = aux;
	if(isChecked()){
		board[row][col] = aux2;
		board[currentRow][currentCol] = aux;
		return false;
	} else{
		board[row][col] = aux2;
		board[currentRow][currentCol] = aux;
		return true;
	}
}

// Função para verificar se o roque é possível
function canICastle(row, col){
	var elems = document.getElementsByClassName('cell');
	if(board[currentRow][currentCol] === 'king' && board[row][col]==='rook' && WkingMoved === 0){
		if(col === 0 && RWMoved[0] === 0){
			if(board[7][1] === '' && board[7][2] ==='' && board[7][3]===''){
				board[7][4]='';
				board[7][3]='king';
				if(!isChecked()){
					check = 0;
					board[7][3]='';
					board[7][2]='king';
					if(!isChecked()){
						check = 0;
						board[7][2]='';
						board[7][4]='king';
						return true;
					}
				}
				board[7][4]='king';
				board[7][3]='';
				board[7][2]='';
			}	
		} 
		if(col === 7 && RWMoved[1] === 0){
			if(board[7][6] === '' && board[7][5] ===''){
				board[7][4]='';
				board[7][5]='king';
				if(!isChecked()){
					check = 0;
					board[7][5]='';
					board[7][6]='king';
					if(!isChecked()){
						check = 0;
						board[7][6]='';
						board[7][4]='king';
						return true;
					}
				}
				board[7][4]='king';
				board[7][5]='';
				board[7][6]='';
			}
		}

	} else if (board[currentRow][currentCol] === 'bking' && board[row][col]==='brook' && BkingMoved === 0){
		if(col === 0 && RBMoved[0] === 0){
			if(board[0][1] === '' && board[0][2] ==='' && board[0][3]===''){
				kingb2 = 3;
				if(!isChecked()){
					check = 0;
					kingb2 = 2;
					if(!isChecked()){
						check = 0;
						kingb2 = 4;
						return true;
					}
				}
			}
		}
		if(col === 7 && RBMoved[0] === 0){
			if(board[0][5] === '' && board[0][6] ===''){
				kingb2 = 5;
				if(!isChecked()){
					check = 0;
					kingb2 = 6;
					if(!isChecked()){
						check = 0;
						kingb2 = 4;
						return true;
					}
				}
			}
		}
	}
	return false;
}

// Função para fazer o movimento do roque
function castleMove(row, col){
	//castle = 0;
	let rook = board[row][col];
	var elems = document.getElementsByTagName('span');
	board[row][col] = '';
	board[currentRow][currentCol] = '';
	if(col === 0){
		board[row][2] = selectedPiece;
		board[row][3] = rook;
		
		if(row === 0){
			RBMoved[0] = 1;
			BkingMoved = 1;
			for(let i=0;i<8;i++){
				elems[i].innerHTML = getPieces(row, i);
			}
		}else{
			RWMoved[0] = 1;
			WkingMoved = 1;
			for(let i=0;i<8;i++){
				elems[56 + i].innerHTML = getPieces(row, i);
			}
		}
	} else if(col === 7){
		board[row][6] = selectedPiece;
		board[row][5] = rook;

		if(row === 0){
			RBMoved[1] = 1;
			BkingMoved = 1;
			for(let i=0;i<8;i++){
				elems[i].innerHTML = getPieces(row, i);
			}
		}else{
			RWMoved[1] = 1;
			WkingMoved = 1;
			for(let i=0;i<8;i++){
				elems[56 + i].innerHTML = getPieces(row, i);
			}
		}
	}
}

// Função para setar a castleFlag
function castleFlagHandler(flag){
	switch(flag){
		case 1:
			RWMoved[0] = 1;
			break;
		case 2:
			RWMoved[1] = 1;
			break;
		case 3:
			RBMoved[0] = 1;
			break;
		case 4:
			RBMoved[1] = 1;
			break;
		case 5:
			WkingMoved = 1;
			break;
		case 6:
			BkingMoved = 1;
			break;

	}
}

// Função para gravar histórico do lance
function recordHistory(board, turn){
	history[turn-1] = board;
}

// Função para voltar jogo para lance específico

function returnGame(aturn){
	var elems = document.getElementsByTagName('span');
	turn = aturn;
	board = history[turn-1];
	for(let i = 0; i<8;i++){
		for(let j = 0; j<8;j++){
			elems[8*i + j].innerHTML = getPieces(i, j);
		}
	}
}