from collections import namedtuple

geladeira = namedtuple("geladeira", ("nivelAgua", "comidasFaltando"))

registroAlimento = namedtuple("registroAlimento", ("id", "comida", "quantidade"))

clima = namedtuple("clima", ("temperatura"))

iluminacao = namedtuple("iluminacao", ("iluminancia"))

comodos = namedtuple("comodos", ("nome", "clima", "iluminacao"))


def nivel_esta_baixo(nivel_agua: int) -> bool:
    pass

def threshold_temperatura(temperatura: float) -> float:
    pass
