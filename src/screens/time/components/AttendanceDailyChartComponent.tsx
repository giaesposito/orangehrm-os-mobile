/*
 * This file is part of OrangeHRM
 *
 * Copyright (C) 2020 onwards OrangeHRM (https://www.orangehrm.com/)
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import React from 'react';
import {View, Text, StyleSheet, useWindowDimensions} from 'react-native';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryLabel,
  VictoryStack,
} from 'victory-native';
import {VictoryBarProps} from 'victory-bar';
import {
  GraphDataPoint,
  LeaveTypeGraphData,
  ShortDay,
} from 'store/time/attendance/types';
import useTheme from 'lib/hook/useTheme';
import CardContent from 'components/DefaultCardContent';
import {$PropertyType} from 'utility-types';
import Card from 'components/DefaultCard';
import {getWeekdayOrder} from 'lib/helpers/attendance';
import {getViewportWidth} from 'lib/helpers/dimension';

const AttendanceDailyChartComponent = (
  props: AttendanceDailyChartComponentProps,
) => {
  const theme = useTheme();
  const window = useWindowDimensions();

  const events: $PropertyType<VictoryBarProps, 'events'> = [
    {
      childName: 'all',
      target: 'data',
      eventHandlers: {
        onPressIn: () => {
          return [
            {
              target: 'data',
              mutation: (properties) => {
                props.onPressBar(properties.datum.x);
              },
            },
          ];
        },
      },
    },
  ];

  const width = getViewportWidth(window.width);
  const chartWidth =
    width === window.width ? width : width - theme.spacing * 10;

  const renderGraph = () => {
    return (
      <View>
        <VictoryChart
          domainPadding={
            window.width < window.height ? theme.spacing * 5 : theme.spacing * 8
          }
          width={chartWidth}>
          <VictoryAxis
            dependentAxis
            style={{
              axis: {stroke: theme.palette.background},
              grid: {stroke: theme.palette.default},
              ticks: {
                stroke: theme.palette.default,
                fontSize: theme.typography.fontSize,
              },
              tickLabels: {
                fontSize: theme.typography.tinyFontSize,
                padding: theme.spacing,
              },
            }}
            tickLabelComponent={
              <VictoryLabel
                text={(datum) => {
                  const tickValue =
                    datum.index !== undefined ? datum.ticks[datum.index] : 0;

                  if (Number.isInteger(tickValue)) {
                    return tickValue + ' Hrs';
                  } else {
                    const maxLeaveYPoint =
                      props.graphLeaveData.length > 0
                        ? props.graphLeaveData
                            .map((singleType) => {
                              const maxx = singleType.data
                                .map((dataPoint) => {
                                  return dataPoint.y;
                                })
                                .reduce(function (previous, current) {
                                  return previous > current
                                    ? previous
                                    : current;
                                });
                              return maxx;
                            })
                            .reduce(function (previous, current) {
                              return previous > current ? previous : current;
                            })
                        : 0;

                    const maxWorkYPoint =
                      props.graphWorkData.length > 0
                        ? props.graphWorkData
                            .map((dataPoint) => {
                              return dataPoint.y;
                            })
                            .reduce(function (previous, current) {
                              return previous > current ? previous : current;
                            })
                        : 0;

                    const maxYPoint =
                      maxWorkYPoint > maxLeaveYPoint
                        ? maxWorkYPoint
                        : maxLeaveYPoint;
                    if (maxYPoint < 1 && maxYPoint > 0) {
                      return tickValue + ' Hrs';
                    } else {
                      return '';
                    }
                  }
                }}
              />
            }
          />
          <VictoryAxis
            style={{
              grid: {stroke: theme.palette.background},
              ticks: {
                stroke: theme.palette.default,
                fontSize: theme.typography.fontSize,
              },
              tickLabels: {
                fontSize: theme.typography.tinyFontSize,
                padding: theme.spacing * 1.5,
              },
            }}
            tickFormat={getWeekdayOrder(props.weekStartDayIndex, 'dd')}
          />
          <VictoryAxis
            style={{
              grid: {stroke: theme.palette.background},
              ticks: {
                stroke: theme.palette.default,
                fontSize: theme.typography.fontSize,
              },
              tickLabels: {
                fontSize: theme.typography.tinyFontSize,
                padding: theme.spacing * 5,
              },
            }}
            tickFormat={props.dateOfMonth}
          />

          <VictoryStack>
            <VictoryBar
              style={{data: {fill: theme.palette.secondary}}}
              data={props.graphWorkData}
              events={events}
            />
            {props.graphLeaveData.map((leaveTypeData, index) => {
              return (
                <VictoryBar
                  key={index}
                  style={{data: {fill: leaveTypeData.colour}}}
                  data={leaveTypeData.data}
                  events={events}
                />
              );
            })}
          </VictoryStack>
        </VictoryChart>
      </View>
    );
  };

  return (
    <View style={{paddingHorizontal: theme.spacing * 3}}>
      <Card
        style={{
          backgroundColor: theme.palette.background,
          borderRadius: theme.borderRadius * 2,
        }}>
        <CardContent
          style={{
            paddingTop: theme.spacing * 2,
            backgroundColor: theme.palette.background,
            borderRadius: theme.borderRadius * 2,
            paddingLeft: theme.spacing * 3,
            paddingRight: theme.spacing * 5,
          }}>
          <View
            style={{
              paddingTop: theme.spacing * 2,
              paddingLeft: theme.spacing * 2,
            }}>
            <Text style={{fontSize: theme.typography.subHeaderFontSize}}>
              {'Daily Hours'}
            </Text>
          </View>
          <View style={styles.flex}>{renderGraph()}</View>
        </CardContent>
      </Card>
    </View>
  );
};

interface AttendanceDailyChartComponentProps {
  graphLeaveData: LeaveTypeGraphData[];
  graphWorkData: GraphDataPoint[];
  dateOfMonth: string[];
  onPressBar: (day: ShortDay) => void;
  weekStartDayIndex: number;
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});

export default AttendanceDailyChartComponent;
