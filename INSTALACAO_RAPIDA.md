# ⚡ INSTALAÇÃO RÁPIDA - INFINITYFREE

## 📦 DOWNLOAD

**Baixe aqui:** https://www.genspark.ai/api/files/s/AmKYeLOt

Extraia e use: `hostgator-deploy/infinityfree-package.zip`

---

## 🚀 INSTALAÇÃO (6 PASSOS)

### 1. Criar Banco (InfinityFree cPanel)
```
MySQL Databases → Create Database
- Database: producao
- User: producao_user
- Password: SuaSenha123!
- Privileges: ALL

✅ Anote:
- Host: sql###.infinityfree.com
- Database: epizXXXXX_producao
- User: epizXXXXX_producao_user
- Password: SuaSenha123!
```

### 2. Editar config.php
Abra `config.php` e edite:
```php
define('DB_HOST', 'sql###.infinityfree.com');
define('DB_NAME', 'epizXXXXX_producao');
define('DB_USER', 'epizXXXXX_producao_user');
define('DB_PASS', 'SuaSenha123!');
```

### 3. Upload (cPanel File Manager)
```
htdocs/
├── config.php (editado)
├── login.html
├── designer.php
├── database.sql
├── .htaccess
└── api/ (pasta completa)
```

### 4. Importar Banco (phpMyAdmin)
```
phpMyAdmin → epizXXXXX_producao
→ Import → database.sql → Go
✅ "Import has been successfully finished"
```

### 5. Testar Login
```
https://seusite.infinityfreeapp.com
Login: Amanda / Amanda123
✅ Deve entrar
```

### 6. Testar Checkbox OK
```
1. Digite "2" na quantidade
2. Clique OK ✓
✅ Linha verde
✅ Status "CRIADA"
✅ Criadas +2
```

---

## ✅ SE TUDO FUNCIONOU

🎉 **SISTEMA INSTALADO COM SUCESSO!**

---

## ❌ SE NÃO FUNCIONOU

1. Verifique config.php (host, banco, user, senha)
2. Confirme que database.sql foi importado
3. Verifique se todos arquivos foram enviados
4. Limpe cache do navegador (Ctrl+F5)

---

## 🔑 CREDENCIAIS

**Admin:** admin / admin123  
**Designer:** Amanda / Amanda123

---

## 📖 DOCUMENTAÇÃO COMPLETA

Abra: `README_V8_2_INFINITYFREE.md`

---

## ⏱️ TEMPO TOTAL: 10 MINUTOS

**Pronto! 🚀**
