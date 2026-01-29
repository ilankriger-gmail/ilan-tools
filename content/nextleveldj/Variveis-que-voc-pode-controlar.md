# Variáveis que você pode controlar

<div>  Variáveis que você pode controlar</div>
<div><br></div>
<div>  1. temperature (linha 120)</div>
<div><br></div>
<div>  temperature: 0.3</div>
<div>  - 0.0 - 0.3 = Mais consistente/previsível (atual)</div>
<div>  - 0.5 - 0.7 = Mais criativo/variado</div>
<div>  - 0.8 - 1.0 = Muito criativo/imprevisível</div>
<div><br></div>
<div>  2. max_tokens (linha 121)</div>
<div><br></div>
<div>  max_tokens: 500</div>
<div>  Limite de tamanho da resposta. 500 é suficiente para o JSON.</div>
<div><br></div>
<div>  3. O Prompt (linhas 70-103)</div>
<div><br></div>
<div>  É onde você define os critérios de avaliação:</div>
<div><br></div>
<div>  Avalie considerando:</div>
<div>  1. Tom da mensagem (positivo, construtivo, neutro, negativo, agressivo)</div>
<div>  2. Nivel de engajamento demonstrado na resposta</div>
<div>  3. Qualidade do feedback (detalhado e genuino vs generico ou superficial)</div>
<div>  4. Alinhamento com valores de uma comunidade saudavel</div>
<div>  5. Sinais de que seria um membro ativo e contributivo</div>
<div><br></div>
<div>  4. Regras de decisão (no prompt)</div>
<div><br></div>
<div>  - Score alto (9-10) + feedback positivo = aprovar</div>
<div>  - Score baixo (0-6) + feedback construtivo = pode aprovar</div>
<div>  - Feedback genérico = menor engajamento</div>
<div>  - Tom agressivo = rejeitar</div>
<div><br></div>
<div>  ---</div>
<div>  Quer ajustar algo?</div>
<div><br></div>
<div>  Posso modificar:</div>
<div>  - Critérios de avaliação (adicionar/remover)</div>
<div>  - Limites de score para cada recomendação</div>
<div>  - Temperature para respostas mais/menos consistentes</div>
<div>  - O prompt inteiro para mudar a lógica de seleção</div>

