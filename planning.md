Geladeira: {
    nivelAgua: Float[0-1],
    comidaFaltando: [
        { comida: String, quantidade: String }
    ]
}

Clima: {
    temperatura: Float,
}

Iluminacao: {
    Lumens: Float,
}

Comodos: [
    {
        Nome: String,
        Clima: Clima,
        Iluminacao: Ilumincacao,
    }
]


Ações da geladeira:
· Envia para o servidor o nível de água
· Envia para o servidor uma atualização de comida e quantidade
· Envia para o servidor uma deleção de comida
· Envia para o servidor uma inclusão de comida e quantidade

Ações dos medidores:
- de temperatura:
· Envia para o servidor a temperatura

- de iluminação
· Envia para o servidor a luminescência
