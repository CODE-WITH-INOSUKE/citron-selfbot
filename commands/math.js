module.exports = {

  name: 'math',

  description: 'Evaluates a mathematical expression. Usage: !math <expression>',

  async execute(message, args, client) {

    if (!args.length) {

      return message.reply('Please provide a mathematical expression (e.g., 2 + 2).');

    }

    const expression = args.join(' ');

    try {

      // Basic sanitization to allow only numbers, operators, and parentheses

      if (!/^[0-9+\-*/().\s]+$/.test(expression)) {

        return message.reply('Invalid expression. Use numbers and operators (+, -, *, /, ()).');

      }

      const result = eval(expression); // Note: eval is risky; consider using a library like mathjs for production

      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {

        return message.reply('Invalid result. Please check your expression.');

      }

      await message.reply(`Result: ${result}`);

    } catch (error) {

      await message.reply('Error evaluating expression. Please check your input.');

    }

  }

};