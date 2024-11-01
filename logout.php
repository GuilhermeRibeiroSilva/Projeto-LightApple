<?php
session_start();
session_destroy(); // Destrói todas as informações da sessão
header('Location: entar.php'); // Corrigido para entar.php
exit();