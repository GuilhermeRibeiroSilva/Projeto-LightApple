<?php
session_start();
session_destroy(); // Destrói todas as informações da sessão
header('Location: login.php'); // Redireciona para a página de login
exit();
