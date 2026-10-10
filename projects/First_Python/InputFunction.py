name = input("what is your name : ")
print(f"hello {name}")
age = input("how old are you : ")
print(f"you are {age} years old.")
# age =  age + 1 - as age is a string this will not work
# print (f"you age next year is : ") - this will show error
age = int(age)
age += 1
print(f"You will be {age} years old next birthday.")

yesorno = input("do you want to find the area of a sqaure or a rectangle (y/n) : ")
if yesorno == 'y' :
    length = float (input("enter your length : "))
    width = float(input("enter your width : "))
    area = length * width
    print(f"the area is {area} squared units") 
    print("Thank you for interacting")
else :
    print("Thank you for interacting")

