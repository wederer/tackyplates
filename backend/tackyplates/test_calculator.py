from tackyplates import calculator
import pytest

@pytest.mark.parametrize("start_distance,experiment_gap,measurement_gap,ball_diameter,length,expected", [
    (0, 1.0, 0.5, 4.0, 10, [0, 4.5, 9.0, 13.5, 18.0, 22.5, 27.0, 31.5, 36.0, 40.5]),
    (0, 1.0, 0.5, 5.0, 8, [0.0, 5.5, 11.0, 16.5, 22.0, 27.5, 33.0, 38.5]),
    (10, 1.0, 0.5, 4.0, 12, [10.5, 15.0, 19.5, 24.0, 28.5, 33.0, 37.5, 42.0, 46.5, 51.0, 55.5, 60.0]),
    (0, 5.0, 0.5, 5.0, 10, [0.0, 5.5, 11.0, 16.5, 22.0, 27.5, 33.0, 38.5, 44.0, 49.5]),
    (0, 5.0, 2, 5.0, 10, [0.0, 7.0, 14.0, 21.0, 28.0, 35.0, 42.0, 49.0, 56.0, 63.0]),
])
def test_calc_position(start_distance, experiment_gap, measurement_gap, ball_diameter, length, expected):
    positions = []
    for n in range(length):
        positions.append(calculator.calc_position(start_distance, experiment_gap, measurement_gap, ball_diameter, n))

    print("calculated", positions)
    assert positions == expected
