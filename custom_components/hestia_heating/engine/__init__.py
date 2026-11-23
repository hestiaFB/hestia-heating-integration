"""The brick's reasoning, in plain Python: no Home Assistant here, so every rule is tested without it.

`reader.py` (the only module that touches Home Assistant) hands it plain dictionaries: the states and attributes of the
thermostats, the stove's entities, Suivi Stock Pellet, the Scheduler switches and Hestia Weather's forecast.
"""
