# Python code to demonstrate
# call by value

#Same Reference, No Change
def same_list(list):
    return list

mylist = ["X"]
same_list(mylist)
print()
print(mylist)
print()
string = "Deepshikha"

# Re-assignment with Immutable behavior
def add(list):
    list = ["X", "B"]  # reassignment, not in-place modification
    return list

my_lists = ["X"]
add(my_lists)
print(my_lists)
print()

# Immutable Integer
def fun(x):
    x = x + 10
    print("Inside function:", x)

num = 5
fun(num)
print("Outside function:", num)
print()

# example
def test(string):
    string = "Deepshikhadey"
    print("Inside Function:", string)
test(string)
print("Outside Function:", string)
print()



# Python code to demonstrate
# call by reference

# No Change (Same Reference, No Modification)
def same_list(list):
    return list

my_list4 = ["X"]
same_list(my_list4)
print(my_list4)
print()

# Re-assignment (New Object Inside Function)
def set_list2(list):
    list = ["A"]
    return list

my_list3 = ["X"]
set_list2(my_list3)
print(my_list3)
print()

#: In-Place Modification
def add(list):
    list.append("B")
    return list

my_list2 = ["X"]
add(my_list2)
print(my_list2)
print()

#example
def add_more(list):
    list.append(50)
    print("Inside Function", list)

mylist = [10, 20, 30, 40]

add_more(mylist)
print("Outside Function:", mylist)
print()