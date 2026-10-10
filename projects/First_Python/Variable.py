# variable is a container for value

#Strings
First_Name = "Deepshikha"
Last_Name = "Dey"
Season = "Winter"

print("First_Name")
print(First_Name)
print(f"The name is : {First_Name} {Last_Name}")
print(f"Favorite Season is {Season}")


#Intergers

Age = 21
items = 4
parties = 2

print(f"{First_Name} is {Age} years old and is celebrating {parties} parties this year. She has recieved {items} this year :) ")

#Float 

Cgpa = 8.9
price = 20.99

print(f"Her Cgpa uptil 5th semester is {Cgpa} And she has spent ${price} on food")

#Boolean

Is_student = True
Is_married = False

if Is_married and Is_student :
    print("she is married and is a student")
elif not Is_married and Is_student :
    print("She is a student and is not married")
elif not Is_student and Is_married :
    print("Is married and not a student")
else :
    print("Is not a student and not married")

