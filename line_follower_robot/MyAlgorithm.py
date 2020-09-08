#!/usr/bin/python
# -*- coding: utf-8 -*-
import threading
import time
from datetime import datetime
import sys
import math
import cv2
import numpy as np
from gui.GUI import MainWindow
from PyQt5.QtWidgets import QApplication
import imutils
import matplotlib.pyplot as mp



time_cycle = 80



class MyAlgorithm(threading.Thread):

    def __init__(self, camera, motors):
        self.camera = camera
        self.motors = motors
        self.threshold_image = np.full((640, 360, 3),0,dtype= np.uint8)
        self.color_image = np.full((640, 360, 3),0,dtype= np.uint8)
        self.stop_event = threading.Event()
        self.kill_event = threading.Event()
        self.lock = threading.Lock()
        self.threshold_image_lock = threading.Lock()
        self.color_image_lock = threading.Lock()
        threading.Thread.__init__(self, args=self.stop_event)

    def getImage(self):
        self.lock.acquire()
        img = self.camera.getImage().data
        self.lock.release()
        return img

    def set_color_image(self, image):
        img = np.copy(image)
        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)

        self.color_image_lock.acquire()
        self.color_image = img
        self.color_image_lock.release()


    def get_color_image(self):
        self.color_image_lock.acquire()
        img = np.copy(self.color_image)
        self.color_image_lock.release()
        return img


    def set_threshold_image(self, image):
        img = np.copy(image)

        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)



        self.threshold_image_lock.acquire()
        self.threshold_image = img
        self.threshold_image_lock.release()


    def get_threshold_image(self):
        self.threshold_image_lock.acquire()
        img = np.copy(self.threshold_image)
        self.threshold_image_lock.release()
        return img

    def run(self):

        while (not self.kill_event.is_set()):


            start_time = datetime.now()
            if not self.stop_event.is_set():
                self.algorithm()
            finish_Time = datetime.now()
            dt = finish_Time - start_time
            ms = (dt.days * 24 * 60 * 60 + dt.seconds) * 1000 + dt.microseconds / 1000.0
            # print (ms)
            if (ms < time_cycle):
                time.sleep((time_cycle - ms) / 1000.0)



    def stop(self):
        self.stop_event.set()
        #print("stop")
    def play(self):
        if self.is_alive():
            self.stop_event.clear()
        else:
            self.start()
        #print("play")

    def kill(self):
        self.kill_event.set()
        #print("kill")

    def algorithm(self):
        #GETTING THE IMAGES
        image = self.getImage()

        height = 260
        # get lower and upper limits of red color
        low_red = np.array([0, 100, 32])
        high_red = np.array([10, 255, 255])

        # filter them with mask
        img_hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
        mask = cv2.inRange(img_hsv, low_red, high_red)
        # convert the grayscale image to binary image
        centreheight = mask[height].astype(np.int16)
        # Subttract the pixels to identify white starting point and ending point
        diff_1 = np.diff(centreheight)

        #find index values of those points
        l = []
        c = 0
        for i in diff_1:
            c = c + 1
            if i != 0:

               l.append(c-1)
        arr = np.array(l)
        points_0 = (arr,)

        #Take average of them to get centre of the red line
        centre = np.average(points_0[0])
        centre = int(centre)


        cv2.line(image, (320, height), (centre, height), (255,0,0), 8)
        cv2.circle(image, (centre, height), 5, (255, 255, 255), -1)
        cv2.line(image, (320, 0), (320, 600), (0, 0, 0), 5)

        # subtract the red line centre with camera centre to get error
        error = centre - 320
        if (centre < 310):

            self.motors.sendV(12)
            self.motors.sendW(0.02)
            if (centre < 300):

                sendV1 = (-0.04 * (-error)) + 10.8
                self.motors.sendV(sendV1)
                sendW1 = ((0.03 * (-error)) - 0.5)
                print("Linear V - {}  ,  Angular W - {}".format(sendV1,sendW1))
                self.motors.sendW(sendW1)

        elif (centre > 330):

            self.motors.sendV(12)
            self.motors.sendW(-0.02)
            if (centre > 340):

                sendV2 = (-0.04 * (error)) + 10.8
                self.motors.sendV(sendV2)
                sendW2 = -((0.03 * (error)) - 0.5)
                self.motors.sendW(sendW2)
                print("Linear V - {}  ,  Angular W - {}".format(sendV2,sendW2))
        else:
            self.motors.sendV(12)

        #Show the filtered image on the GUI
        self.set_threshold_image(mask)


