import os
import time
import threading
from tkinter import Tk, Button, Label, messagebox, Toplevel, Scrollbar, Frame, VERTICAL, RIGHT, Y, LEFT, BOTH, X, \
    Checkbutton, IntVar, Listbox
from tkinter import ttk
from PIL import Image, ImageTk
import pyscreenshot as ImageGrab
from pynput import mouse

# Global variables
capturing = False
screenshots = []
screenshot_vars = []
listener = None

# Create a directory to save screenshots
if not os.path.exists('screenshots'):
    os.makedirs('screenshots')


# Functions for mouse click events
def on_click(x, y, button, pressed):
    if pressed and capturing:
        # Capture the screen
        screenshot = ImageGrab.grab()
        screenshots.append(screenshot)
        var = IntVar()
        screenshot_vars.append(var)
        update_listbox()
        print(f'Screenshot taken at ({x}, {y})')


def start_capturing():
    global capturing, listener
    capturing = True
    if listener is None:
        listener = mouse.Listener(on_click=on_click)
        listener.start()
    print("Started capturing")


def pause_capturing():
    global capturing
    capturing = False
    print("Paused capturing")


def stop_capturing():
    global capturing, listener
    capturing = False
    if listener is not None:
        listener.stop()
        listener = None
    print("Stopped capturing")


# Functions for GUI actions
def save_selected_images():
    selected_indices = [i for i, var in enumerate(screenshot_vars) if var.get() == 1]
    for i in selected_indices:
        screenshots[i].save(f'screenshots/screenshot_{int(time.time())}_{i}.png')
    messagebox.showinfo("Saved", f"Saved {len(selected_indices)} images.")


def update_listbox():
    for widget in listbox_frame.winfo_children():
        widget.destroy()
    for i, (screenshot, var) in enumerate(zip(screenshots, screenshot_vars)):
        chk = Checkbutton(listbox_frame, text=f'Screenshot {i + 1}', variable=var)
        chk.pack(anchor='w')


def show_image(event):
    selected_index = listbox.curselection()
    if selected_index:
        img = screenshots[selected_index[0]]
        img.thumbnail((400, 400))
        img_tk = ImageTk.PhotoImage(img)
        img_label.config(image=img_tk)
        img_label.image = img_tk


def select_all():
    for var in screenshot_vars:
        var.set(1)


def unselect_all():
    for var in screenshot_vars:
        var.set(0)


def open_image_viewer():
    viewer = Toplevel(root)
    viewer.title("Captured Images")

    frame = Frame(viewer)
    frame.pack(fill=BOTH, expand=1)

    scrollbar = Scrollbar(frame, orient=VERTICAL)
    scrollbar.pack(side=RIGHT, fill=Y)

    viewer_listbox = Listbox(frame, yscrollcommand=scrollbar.set)
    viewer_listbox.pack(side=LEFT, fill=BOTH, expand=1)

    scrollbar.config(command=viewer_listbox.yview)

    img_label = Label(viewer)
    img_label.pack()

    def show_image_in_viewer(event):
        selected_index = viewer_listbox.curselection()
        if selected_index:
            img = screenshots[selected_index[0]]
            img_label.img = ImageTk.PhotoImage(img)  # Keep a reference to avoid garbage collection
            img_label.config(image=img_label.img)
            img_label.bind('<Double-1>', lambda e: open_fullsize_image(img))  # Bind double click to open image

    viewer_listbox.bind('<<ListboxSelect>>', show_image_in_viewer)

    for i, screenshot in enumerate(screenshots):
        viewer_listbox.insert('end', f'Screenshot {i + 1}')

def open_fullsize_image(image):
    fullsize_viewer = Toplevel(root)
    fullsize_viewer.title("Full-size Image")

    img_label_fullsize = Label(fullsize_viewer)
    img_label_fullsize.pack()

    img = image.copy()  # Create a copy to avoid modifying the original image
    img_tk_fullsize = ImageTk.PhotoImage(img)
    img_label_fullsize.config(image=img_tk_fullsize)
    img_label_fullsize.image = img_tk_fullsize  # Keep a reference

# Create the GUI
root = Tk()
root.title("Screen Capture Tool")

control_frame = Frame(root)
control_frame.pack(fill=X, padx=10, pady=10)

start_button = Button(control_frame, text="Start", command=start_capturing, width=10)
pause_button = Button(control_frame, text="Pause", command=pause_capturing, width=10)
stop_button = Button(control_frame, text="Stop", command=stop_capturing, width=10)
view_button = Button(control_frame, text="View Captures", command=open_image_viewer, width=15)
save_button = Button(control_frame, text="Save Selected", command=save_selected_images, width=15)
select_all_button = Button(control_frame, text="Select All", command=select_all, width=10)
unselect_all_button = Button(control_frame, text="Unselect All", command=unselect_all, width=10)

start_button.pack(side=LEFT, padx=5)
pause_button.pack(side=LEFT, padx=5)
stop_button.pack(side=LEFT, padx=5)
view_button.pack(side=LEFT, padx=5)
save_button.pack(side=LEFT, padx=5)
select_all_button.pack(side=LEFT, padx=5)
unselect_all_button.pack(side=LEFT, padx=5)

listbox_frame = Frame(root)
listbox_frame.pack(fill=BOTH, expand=1, padx=10, pady=10)

# Create the listbox to display screenshots
listbox = Listbox(listbox_frame)
listbox.pack(fill=BOTH, expand=1)

img_label = Label(root)
img_label.pack(padx=10, pady=10)


def update_gui():
    while True:
        update_listbox()
        time.sleep(1)


thread = threading.Thread(target=update_gui, daemon=True)
thread.start()

root.mainloop()