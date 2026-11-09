# Reading Platform — Pilot

Protótipo funcional da plataforma de leitura em inglês. Sem login e sem banco de dados:
**tudo fica em memória e some ao fechar/recarregar a página.**

## Como rodar

Abra o `index.html` no navegador.

## O que está funcionando

- **Home**: "Hi, Student", botão *Start new reading* (vira *Continue reading* se houver livro em andamento), streak e biblioteca.
- **Header**: logo/home, Library, Stats, botão de dark/light mode, menu Account.
- **Biblioteca**: grid com capa, nome, faixa etária e status (não lido / em andamento / lido).
  Clique abre overlay com capa, sinopse e botão READ. Só *Snow White* é funcional; os demais são visuais.
- **Leitor**: frase por frase; lidas acima (um pouco apagadas), atual destacada, próximas 2 com blur.
  Botão Next/Back, tela de abertura de capítulo, resumo ao fim de cada capítulo e do livro.
- **Quiz**: 1 pergunta por sessão, Check → "Correct!" animado (verde) ou "Not quite" com a resposta certa (vermelho).
- **Menu de pausa**: pelo botão de pause ou pela mini capa. Continue, Chapters (pular para capítulos já liberados),
  Night/Day Mode, To Library, Shortcuts.
- **Stats**: velocidade média, palavras, tempo, acerto nos quizzes, streak, livros terminados e histórico por sessão.
- **Atalhos**: `Enter`/`Espaço`/`→` avança, `←` volta, `1`–`4` escolhe resposta, `Esc`/`P` pausa.

## Cálculo de WPM

1. Ao "cadastrar" o livro, `prepareBook()` conta as palavras de cada frase, sessão e capítulo
   (simula o que o painel administrativo fará ao salvar um texto).
2. Cada vez que o aluno aperta **Next** numa frase nova, o sistema soma as palavras daquela frase
   e o tempo que ela ficou na tela aos totais acumulados.
3. `WPM = total de palavras ÷ total de minutos`. O valor no canto superior esquerdo é atualizado a cada Next.

Regras:
- O relógio **para** no pause, nas telas de quiz, abertura e resumo de capítulo.
- Trocar de aba ou minimizar pausa automaticamente.
- Reler frases (Back ou voltar a um capítulo) **não** soma de novo.

É a mesma conta "palavras da sessão + tempo da sessão somados ao acumulado", só que feita frase a frase,
então o número se atualiza a cada clique e o resultado por sessão fica igual.

## Próximos passos (fora do piloto)

Login/contas, banco de dados, painel administrativo (cadastro de livros, capas, páginas e quizzes),
painel de acompanhamento dos alunos.
