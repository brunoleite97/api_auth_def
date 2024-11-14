const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatorio'),
  body('email').isEmail().withMessage('Email invalido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Senha precisa ter mais de 8 caracteres')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email invalido'),
  body('password').notEmpty().withMessage('Senha é obrigatorio')
];

// Register route
router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        status: 400,
        message: errors.array()[0].msg 
      });
    }

    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({
        status: 400,
        message: 'Email já está em uso'
      });
    }

    const user = new User(req.body);
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || '6454sada1s35fa3s4fa4s6f848afasd4sd76asfa6sf4a6sf4ewtr68j4th4dfgw4fwe',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      status: 201,
      message: 'Usuário registrado com sucesso',
      token
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Erro ao registrar usuário'
    });
  }
});

// Login route
router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 400,
        message: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 401,
        message: 'Email ou senha invalidos'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || '6454sada1s35fa3s4fa4s6f848afasd4sd76asfa6sf4a6sf4ewtr68j4th4dfgw4fwe',
      { expiresIn: '24h' }
    );

    res.json({
      status: 200,
      message: 'Login realizado com sucesso',
      token
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Erro ao realizar login'
    });
  }
});

module.exports = router;