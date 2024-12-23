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

  // Ask the user to choose their side
  handleReply = {
    type: "choose_side",
    author: senderID,
    board: Array.from({ length: 9 }, (_, i) => `${i + 1}️⃣`), // Fill board with numeric placeholders
    sentMessages: [],
  };
  Utils.handleReply.push(handleReply);

  const message = await chat.reply(mono("Choose your side: Reply with `x` for ❌ or `o` for ⭕."));
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
    if (board[a] === board[b] && board[a] === board[c] && !board[a].includes("️⃣")) {
      return board[a];
    }
  }

  return board.some(cell => cell.includes("️⃣")) ? null : "draw";
}

function botMove(board, botSymbol) {
  const playerSymbol = botSymbol === "⭕" ? "❌" : "⭕";
  const emptyIndices = board
    .map((val, idx) => (val.includes("️⃣") ? idx : null))
    .filter(val => val !== null);

  // 20% chance of making a mistake
  if (Math.random() < 0.2) {
    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    board[randomIndex] = botSymbol;
    return;
  }

  // Try to win if possible
  for (const index of emptyIndices) {
    board[index] = botSymbol;
    if (checkWinner(board) === botSymbol) {
      return;
    }
    board[index] = `${index + 1}️⃣`; // Reset to numeric placeholder
  }

  // Try to block the player's winning move
  for (const index of emptyIndices) {
    board[index] = playerSymbol;
    if (checkWinner(board) === playerSymbol) {
      board[index] = botSymbol; // Block the player
      return;
    }
    board[index] = `${index + 1}️⃣`; // Reset to numeric placeholder
  }

  // Make a random move if no winning or blocking move is found
  const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  board[randomIndex] = botSymbol;
}

module.exports["handleReply"] = async ({ chat, event, Utils, font, global }) => {
  const { senderID, body } = event;
  const mono = txt => font.monospace(txt);

  let handleReply = Utils.handleReply.find(reply => reply.author === senderID);

  if (!handleReply) {
    return;
  }

  if (handleReply.type === "choose_side") {
    const choice = body.trim().toLowerCase();
    if (choice !== "x" && choice !== "o") {
      await chat.reply(mono("Invalid choice. Reply with `x` for ❌ or `o` for ⭕."));
      return;
    }

    handleReply.playerSymbol = choice === "x" ? "❌" : "⭕";
    handleReply.botSymbol = choice === "x" ? "⭕" : "❌";
    handleReply.type = "tictactoe";

    const message = await chat.reply(
      mono(`You chose ${handleReply.playerSymbol}. Game started! Reply with a number (1-9) to make your move.\n` + formatBoard(handleReply.board))
    );
    handleReply.sentMessages.push(message);
    return;
  }

  if (handleReply.type === "tictactoe") {
    const move = parseInt(body.trim(), 10) - 1;

    if (isNaN(move) || move < 0 || move > 8 || !handleReply.board[move].includes("️⃣")) {
      await chat.reply(mono("Invalid move. Reply with a number (1-9) corresponding to an empty spot on the board."));
      return;
    }

    const unsendAllMessages = async () => {
      for (const msg of handleReply.sentMessages) {
        await msg.unsend();
      }
      handleReply.sentMessages = [];
    };

    await unsendAllMessages();

    handleReply.board[move] = handleReply.playerSymbol;

    let winner = checkWinner(handleReply.board);
    if (winner) {
      const message = await chat.reply(
        mono(`Game over! ${winner === "draw" ? "It's a draw!" : `Winner: ${winner}`}\n` + formatBoard(handleReply.board))
      );
      handleReply.sentMessages.push(message);
      Utils.handleReply = Utils.handleReply.filter(reply => reply.author !== senderID);
      return;
    }

    botMove(handleReply.board, handleReply.botSymbol);

    winner = checkWinner(handleReply.board);
    if (winner) {
      const message = await chat.reply(
        mono(`Game over! ${winner === "draw" ? "It's a draw!" : `Winner: ${winner}`}\n` + formatBoard(handleReply.board))
      );
      handleReply.sentMessages.push(message);
      Utils.handleReply = Utils.handleReply.filter(reply => reply.author !== senderID);
      return;
    }

    const message = await chat.reply(mono("Your turn! Reply with a number (1-9) to make your move.\n" + formatBoard(handleReply.board)));
    handleReply.sentMessages.push(message);
  }
};
