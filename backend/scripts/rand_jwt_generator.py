import random
import string

chars = string.ascii_letters + string.digits + string.punctuation
jwt_secret_array = random.choices(chars, k=128)
jwt_secret = "".join(jwt_secret_array)

print(jwt_secret)