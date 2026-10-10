# operators  

a = 10
b = 20


c = a + b
print("The sum of a and b is:", c)

d = a - b
print("The difference of a and b is:", d)

e = a * b
print("The product of a and b is:", e)

f = b / a
print("The division of b by a is:", f)

g = b // a
print("The floor division of b by a is:", g)

h = b % a
print("The modulus of b by a is:", h)

i = a ** 2
print("The square of a is:", i)

j = a ** 3
print("The cube of a is:", j)

k = a ** 0.5
print("The square root of a is:", k)


# conditional operators


if a > b:
    print("a is greater than b")
elif a < b:
    print("a is less than b")
elif a == b:
    print("a is equal to b")
elif a != b:
    print("a is not equal to b")
elif a >= b:
    print("a is greater than or equal to b")
elif a <= b:
    print("a is less than or equal to b")
elif a is not b:
    print("a is not b")
elif a is b:
    print("a is b")


# operators conditional but non symbolic 


l = 0
m = 10

if l and m:
    print("l and m are both true")
elif l or m:
    print("either l or m is true")
elif not l:
    print("l is false")
elif not m:
    print("m is false")
elif l and not m:
    print("l is true and m is false")
else:
    print("not valid")
