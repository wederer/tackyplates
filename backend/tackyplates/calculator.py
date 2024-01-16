def calc_position(start_distance: float, experiment_gap: float, measurement_gap: float, ball_diameter: float, index: int):
    # für erstes experiment sollte experiment_gap 0 sein, für den rest die hälfte der gap (andere hälfte hat das experiment davor am ende)
    exp_gap = experiment_gap / 2 if start_distance > 0 else 0
    # index * measurement_gap => measurement_gap für erste(index 0) Messung 0 und dann ab 1. Messung measurement_gap pro Messung
    # (index + 1) + ball_diameter / 2 => eigentliche position wo dann gemessen wird
    # index * ball_diameter / 2 => für alle weiteren Messungen außer der 1. (index 0) müssen wir wieder den halben
    #    ball_diameter draufrechnen um den korrekten abstand zu bekommen
    return start_distance + exp_gap  + index * measurement_gap + index  * ball_diameter / 2 + index * ball_diameter / 2