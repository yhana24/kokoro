module.exports["config"] = {
  name: "tictactoe",
  aliases: ["ttt"],
  version: "1.0.0",
  credits: "Kenneth Panio",
  info: "Play Tic-Tac-Toe against the bot.",
  type: "fun",
  role: 0,
  cd: 5,
};

module.exports["run"] = async ({ chat, args, event, Utils, font, global }) => {
  const mono = txt => font.monospace(txt);
  const { senderID } = event;

  if (!Utils.handleReply) {
    Utils.handleReply = [];
  }

  let handleReply = Utils.handleReply.find(reply => reply.author === senderID);

  if (handleReply) {
    await chat.reply(mono("You already have an ongoing game. Finish it before starting a new one."));
    return;
  }

  handleReply = {
    type: "tictactoe",
    author: senderID,
    board: Array(9).fill("⬛"),
    playerTurn: true,
    sentMessages: [] // Track sent messages
  };
  Utils.handleReply.push(handleReply);

  const message = await chat.reply(mono("Game started! You are X. Reply with a number (1-9) to make your move.\n" + formatBoard(handleReply.board)));
  handleReply.sentMessages.push(message);
};

function formatBoard(board) {
  return `
  ${board[0]}${board[1]}${board[2]}
  ${board[3]}${board[4]}${board[5]}
  ${board[6]}${board[7]}${board[8]}
  `;
}

function checkWinner(board) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (board[a] !== "⬛" && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return board.includes("⬛") ? null : "draw";
}

function botMove(board) {
  const emptyIndices = board.map((val, idx) => (val === "⬛" ? idx : null)).filter(val => val !== null);

  // Simulate occasional mistake
  if (Math.random() < 0.2) { // 20% chance of making a mistake
    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    board[randomIndex] = "⭕"; // Make a random move
  } else {
    // Implement basic strategy to prioritize winning or blocking opponent
    let moveMade = false;

    // Check for winning move
    for (let i = 0; i < emptyIndices.length; i++) {
      const index = emptyIndices[i];
      board[index] = "⭕";
      if (checkWinner(board) === "⭕") {
        moveMade = true;
        break;
      }
      board[index] = "⬛"; // Reset board after checking
    }

    // If no winning move, check for blocking opponent
    if (!moveMade) {
      for (let i = 0; i < emptyIndices.length; i++) {
        const index = emptyIndices[i];
        board[index] = "❌";
        if (checkWinner(board) === "❌") {
          board[index] = "⭕"; // Block opponent
          moveMade = true;
          break;
        }
        board[index] = "⬛"; // Reset board after checking
      }
    }

    // If neither winning nor blocking move, make a random move
    if (!moveMade) {
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      board[randomIndex] = "⭕";
    }
  }
}

module.exports["handleReply"] = async ({ chat, event, Utils, font, global }) => {
  const { senderID, body } = event;
  const mono = txt => font.monospace(txt);

  let handleReply = Utils.handleReply.find(reply => reply.author === senderID);

  if (!handleReply || handleReply.type !== "tictactoe") {
    return;
  }

  const unsendAllMessages = async () => {
    for (const msg of handleReply.sentMessages) {
      await msg.unsend();
    }
    handleReply.sentMessages = [];
  };

  const move = parseInt(body.trim(), 10) - 1;

  if (isNaN(move) || move < 0 || move > 8 || handleReply.board[move] !== "⬛") {
    await chat.reply(mono("Invalid move. Reply with a number (1-9) corresponding to an empty spot on the board."));
    return;
  }

  await unsendAllMessages();

  handleReply.board[move] = "❌";

  let winner = checkWinner(handleReply.board);
  if (winner) {
    const message = await chat.reply(mono(`Game over! ${winner === "draw" ? "It's a draw!" : `Winner: ${winner}`}\n` + formatBoard(handleReply.board)));
    handleReply.sentMessages.push(message);
    Utils.handleReply = Utils.handleReply.filter(reply => reply.author !== senderID);
    return;
  }

  botMove(handleReply.board);

  winner = checkWinner(handleReply.board);
  if (winner) {
    const message = await chat.reply(mono(`Game over! ${winner === "draw" ? "It's a draw!" : `Winner: ${winner}`}\n` + formatBoard(handleReply.board)));
    handleReply.sentMessages.push(message);
    Utils.handleReply = Utils.handleReply.filter(reply => reply.author !== senderID);
    return;
  }

  const message = await chat.reply(mono("Your turn! Reply with a number (1-9) to make your move.\n" + formatBoard(handleReply.board)));
  handleReply.sentMessages.push(message);
};
