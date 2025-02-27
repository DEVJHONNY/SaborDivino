# Sabor Divino 🍫

Sistema de pedidos online para produtos artesanais.

## Funcionalidades

- ✅ Catálogo de produtos
- 🛒 Sistema de pedidos
- 💰 Múltiplas formas de pagamento
- 📦 Controle de estoque
- 📊 Relatórios de vendas
- 🔄 Sincronização com GitHub

## Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- GitHub Pages

## Como usar

1. Acesse: https://devjhonny.github.io/SaborDivino/
2. Escolha seus produtos
3. Preencha seus dados
4. Escolha forma de pagamento
5. Envie o pedido

## Área Administrativa

- URL: https://devjhonny.github.io/SaborDivino/admin.html
- Controle de estoque
- Gerenciamento de produtos
- Relatórios

## Desenvolvido por

Lucas dos Anjos - 2024

## Configuração

Para configurar o projeto:

1. Crie um token no GitHub:
   - Acesse https://github.com/settings/tokens
   - Clique em "Generate new token (classic)"
   - Selecione as permissões: `repo`
   - Copie o token gerado

2. Configure o arquivo local:
   - Copie `config.local.template.js` para `config.local.js`
   - Abra `config.local.js`
   - Cole seu token no campo `GITHUB_TOKEN`

```javascript
const CONFIG_LOCAL = {
    GITHUB_TOKEN: 'sua-api-aqui'
};
```

3. Não compartilhe seu token! O arquivo `config.local.js` já está no `.gitignore`

# Branch Protection
- `site-oficial`: Branch principal de produção
- `manutencao`: Branch para períodos de manutenção

## Alternar entre as branches:

### Para colocar o site em manutenção:
```bash
# No GitHub:
1. Vá em Settings > Pages
2. Mude Source para branch "manutencao"
3. Salve as alterações

# Local:
git checkout manutencao
git merge site-oficial
git push origin manutencao
```

### Para voltar ao normal:
```bash
# No GitHub:
1. Vá em Settings > Pages
2. Mude Source para branch "site-oficial"
3. Salve as alterações

# Local:
git checkout site-oficial
git merge manutencao
git push origin site-oficial
```

## URLs:
- Site Oficial: https://devjhonny.github.io/SaborDivino/
- Página Administrativa: https://devjhonny.github.io/SaborDivino/admin.html
